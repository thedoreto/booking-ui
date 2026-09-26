# CLAUDE.md

## 1. Описание
`booking-ui` е фронтенд (SPA) на хотелска система за резервации ("Хотел Седмата звезда"): вход/регистрация, стаи, потребители, резервации, галерия със снимки (Cloudinary) и информация за хотела. В долния десен ъгъл има чат асистент, който комуникира със **separate AI сървис** (`booking-ai`), а основните данни идват от **booking-system** REST API.

## Архитектурни правила (задължителни)
Важат за трите проекта (booking-ui, booking-ai, booking-system). При всяка промяна първо провери, че не ги нарушава; ако задачата изисква нарушение – спри и питай.
1. **Възможно най-малко заявки към LLM (Gemini).** Това е най-важното правило. Всичко, което може без LLM (бутони, календар, избор на стаи, резервация, отказ, знания по бутон), се прави без LLM. Никога не добавяй второ извикване, когато tool вече е дал отговора (виж `UiActionShortCircuitChatModel`).
2. **UI (чат прозорецът) не знае нищо** освен това, че има чат прозорец, и праща данните на AI асистента (booking-ai). Чатът не вика booking-system, няма бизнес логика и не знае какво прави бутон – показва това, което AI асистентът върне (текст или действие за показване).
3. **AI асистентът праща заявки към бекенда (booking-system) само през Kafka.**
4. **AI асистентът получава данните от бекенда само през Kafka.** Собствената база на booking-ai (`HotelAI`: `knowledge_`, `shortcuts_`, `logs_`) не е бекендът.
5. **Правило 2 важи само за чата.** Страниците на сайта (Hotel Info, Rooms, Bookings и т.н.) са сайтът на хотела и си говорят директно с booking-system през `api.js` – това е правилно и не се мести в AI асистента.
6. **Действията в чата имат отделни адреси в booking-ai и така остават:** `/api/chat` (съобщение или бутон по `shortcutId`), `/api/rooms/available` (избрани дати), `/api/bookings` (избрани стаи), `/api/bookings/cancel` (отказ), `/api/shortcuts`, `/api/rooms/types`. Не ги сливай в `/api/chat` – отделните адреси минават без LLM (правило 1).

## 2. Технологичен стек
- **React 19.2**, чист **JavaScript (JSX)** – няма TypeScript (има само `@types/*` пакети)
- **Vite 8** + `@vitejs/plugin-react`; ESLint 10 (flat config)
- **Routing:** `react-router-dom` v7 (`BrowserRouter` + `<Routes>` в `App.jsx`)
- **State:** без Redux/Zustand – локален `useState` + един `AuthContext` (React Context)
- **Стилове:** смес – основно **inline `style={{}}`**, за чата обект `styles` в `.styles.js`; MUI (`@mui/material`, `@mui/x-date-pickers`, Emotion) се ползва само за date picker-а; малко глобален CSS (`index.css`, `App.css`)
- **HTTP:** `axios` (два инстанса), `dayjs` за дати
- Тестове: Vitest + jsdom + Testing Library

## 3. Структура (`src/`)
- `main.jsx` – вход: `StrictMode` > `BrowserRouter` > `AuthProvider` > `App`
- `App.jsx` – хедър, `NavBar`, всички маршрути, `ChatWindow` (за всички, и за анонимен гост; `key={user?.id || "guest"}` – при вход/изход започва нов разговор)
- `pages/` – по един файл на екран (`Rooms`, `RoomDetails`, `Bookings`, `CreateBooking`, `Users`, `UserDetails`, `Image*`, `HotelInfo`, `Login`, `Register`, `Dashboard`)
- `components/` – споделени (`NavBar`, `ProtectedRoute`); `components/chatWindow/` – чатът като папка: `ChatWindow.jsx`, `ChatWindow.styles.js`, `DateSelectorModal.jsx`, `useChat.js`
- `api/api.js` – axios към основния бекенд (`VITE_API_URL`); `api/aiApi.js` – axios към AI сървиса (`VITE_AI_API_URL`)
- `auth/` – `AuthContext.jsx` (`AuthProvider`), `useAuth.js`
- `public/_redirects` – SPA fallback (`/* /index.html 200`) за Render/Netlify

## 4. Команди
```bash
npm install
npm run dev       # Vite dev server (порт 5173)
npm run build     # продукционен build в dist/
npm run preview   # преглед на build-а
npm run lint      # eslint .
npm test          # Vitest (jsdom + Testing Library), без бекенд
```
Тестове: Vitest с jsdom и Testing Library (`test.environment` във `vite.config.js`), файлове `*.test.jsx` до компонента. Бекендът се mock-ва с `vi.mock` (`../../api/aiApi.js`). Има `chatWindow/RoomImages.test.jsx` и `chatWindow/ChatSession.test.jsx` – останалото се проверява с `npm run lint` + ръчно в браузър. eslint има стари грешки в `pages/` (18) и две в `chatWindow` (`DateSelectorModal.jsx`, `useChat.js`).

Env (`.env`, всички `VITE_*`): `VITE_API_URL` (основен бекенд, напр. `:8080`), `VITE_AI_API_URL` (booking-ai, локално `:8081`), `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`. След промяна – рестарт на dev сървъра.

## 5. Конвенции
- Компоненти и страници: `PascalCase.jsx`, default export; хукове: `useXxx.js`, named/default export; 4 интервала отстъп, двойни кавички за импорти в новите файлове.
- Нови маршрути се добавят в `App.jsx`; защитените се обгръщат с `<ProtectedRoute>`. Публични (за анонимен гост) са само `/hotelinfo`, `/rooms` и `/rooms/:id` (само за четене, ако не си админ); `NavBar` показва на госта Hotel Info, Rooms, Login и Register, а `*` води към `/hotelinfo`. Пътища: `/x`, `/x/:id`, `/x/new` (един и същи компонент за създаване и редакция, напр. `RoomDetails`).
- Заявки към бекенда – през `api` (не сурово `fetch`/нов axios); към AI – през `aiApi`. Чатът ползва **само** `aiApi` (правило 2). Снимките на стаите идват готови в списъка със стаи от AI асистента (`room.images: [{id, url, title}]`); чатът показва до 3 https снимки.
- **Custom hook патърн (образец: `useChat.js`):** цялата логика и state на сложен компонент живеят в `useXxx(props)`, който връща плосък обект със state + handler-и; компонентът остава само за рендериране.
- Стиловете на по-сложен компонент се изнасят в `Component.styles.js` (`export const styles = {...}`); за дребно – inline. Не въвеждай нов стилов подход без нужда.
- UI текстовете и съобщенията за грешки са на **български**; коментарите са на български или английски.
- **Ръчни проверки:** потребителката сама чете кода и тества локално и в Render, преди да приеме промени. Не поставяй задачи и бележки от вида „тест в браузъра“, „провери в Atlas“, „провери/изтрий след deploy“, „не е тествано в браузъра“ – нито в отговорите, нито в `PLAN.md`/`SESSIONS_LOG.md`. Казвай само какво си проверил ти (компилация, unit тестове, build, lint).

## 6. Известни особености и капани
- **`.env` е проследяван от git** (не е в `.gitignore`) и има локални промени. Не го commit-вай и не печатай стойностите; редът с активния `VITE_AI_API_URL` се сменя ръчно между localhost и Render.
- **Двойна auth логика:** `api.js` има собствени interceptor-и (токен от `localStorage`, при 401 → `window.location.href="/login"`), а `AuthContext` регистрира втори набор в `useEffect` със stale `token` от closure. Реално работи `api.js`; не разчитай на този в контекста. Токенът е в `localStorage` под ключ `token`.
- `AuthContext.jsx` експортира и `useAuth`, но `App.jsx` го импортира от `auth/useAuth.js` – две места, поддържай ги съгласувани.
- `Users.jsx` и `RoomDetails.jsx` четат `VITE_API_URL` директно (`API_URL`), а не през `api` инстанса – няма автоматичен токен/401 handling там.
- **Кой е потребителят в чата:** `aiApi.js` праща `Authorization: Bearer <token>` (от `localStorage.token`) към booking-ai; `userId` не се праща никъде. Без токен чатът е за гост. Кои бутони вижда гостът, решава booking-ai (`guest.isActive` на бутона). Всеки отворен чат има свой `sessionId` (`useChat`, `newSessionId()`), който се праща с `/api/chat` – booking-ai пази отделна памет за всеки гост.
- `ChatWindow` получава `hotelId = "40_robbers"` по подразбиране (в `App.jsx` не се подава) – това е ключът за multi-tenant колекциите в booking-ai. Името на хотела в хедъра е хардкоднато в `App.jsx`.
- Отговорът на `/api/chat` е `{ reply|response, actionType }`; `actionType === "OPEN_DATE_PICKER"` отваря `DateSelectorModal`, попълнен с `data.startDate`/`data.endDate`, ако ги има; избраните дати отиват в `POST /api/rooms/available` (без LLM). `actionType === "SELECT_ROOMS"` + `data: {startDate, endDate, rooms}` показва `RoomSelection` в съобщението; бутонът „Резервирай“ вика `POST /api/bookings`. Ако `reply` е обект, се показва като JSON.
- В `main.jsx` има голям закоментиран блок; `App.jsx` не е обвит в `Suspense`/lazy – всичко е в един bundle.
- `git status`: чат компонентът е местен от `components/ChatWindow.jsx` към `components/chatWindow/` (в процес на commit) – импортите трябва да сочат към новата папка.

## 7. Връзка с booking-ai (AI асистент)
Repo: `../booking-ai` (`github.com/thedoreto/booking-ai`) – Java 17 / Spring Boot 3.4 / LangChain4j (Gemini) + MongoDB RAG + Kafka. Има собствен `CLAUDE.md`.
- **Entry point (бекенд):** `com.hotel.BookingAiApplication`; HTTP контролер: `langchain/controller/AiLangChainController.java` (`@RequestMapping("/api")`).
- **Контракт, който UI ползва** (`src/components/chatWindow/useChat.js` през `api/aiApi.js`):
  - Всички заявки носят header `Authorization: Bearer <token>`, ако има вход (`aiApi.js`).
  - `POST /api/chat` – body `{ hotelId, sessionId, messages[], shortcutId?, flowId? }` → `{ reply, actionType, data }`
  - `POST /api/rooms/available` – body `{ hotelId, startDate, endDate, roomType?, flowId? }` → `{ reply, actionType: "SELECT_ROOMS"|null, data: { startDate, endDate, rooms[{…, images[{id,url,title}]}], flowId } }`
  - `POST /api/bookings` – body `{ hotelId, startDate, endDate, roomIds[], flowId? }` → `{ reply, actionType: "BOOKING_CONFIRMED"|null, data }`
  - `POST /api/bookings/cancel` – body `{ hotelId, bookingId, flowId? }` → `{ reply, actionType: "BOOKING_CANCELED"|null, data }`
  - `GET /api/shortcuts?hotelId=…` – бутоните в чата. UI не знае какво прави бутонът: при клик праща `POST /api/chat` с `shortcutId`, а booking-ai връща текст (знание) или действие (`OPEN_DATE_PICKER`, `MY_BOOKINGS`…) според `action` на бутона. Няма подменю с типове стаи под „Нова резервация“ – типът се избира в календара.
- Локално: `./mvnw spring-boot:run` в `../booking-ai` (порт **8081**), после `VITE_AI_API_URL=http://localhost:8081`. Прод: Render (`booking-ai-3s50.onrender.com`, cold start).
- CORS е отворен за `/api/**`. Промяна на request/response формата се прави и на двете места (`AiLangChainController` ↔ `useChat.js`).
