import dayjs from "dayjs";

// Текстовете на прозореца на чата идват от AI асистента (/api/chat/settings → texts, ключове ui.*) на избрания език.
// Тук са само резервните – ако AI асистентът не отговаря, прозорецът пак се чете вместо да показва ключове.
const FALLBACK_TEXTS = {
    "ui.title": "AI асистент",
    "ui.online": "Онлайн",
    "ui.greeting": "Здравейте! С какво мога да помогна днес?",
    "ui.greetingUser": "Здрасти, {name}. С какво мога да помогна днес?",
    "ui.inputPlaceholder": "Напиши съобщение...",
    "ui.send": "Изпрати",
    "ui.connectionError": "Проблем с връзката към сървъра."
};

// Текстът за key; {име} се заменя със стойността от params. Без текст – самият ключ, за да се види какво липсва
export function formatText(texts, key, params = {}) {
    const text = texts?.[key] ?? FALLBACK_TEXTS[key] ?? key;
    return Object.entries(params).reduce(
        (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
        text
    );
}

// „1 нощ“ / „3 нощи“
export function nightsText(t, count) {
    return t(count === 1 ? "ui.night" : "ui.nights", { count });
}

// Локалите на dayjs за календара – зареждат се при нужда, за да не знае UI предварително кои езици има
const DAYJS_LOCALES = import.meta.glob("/node_modules/dayjs/locale/*.js");

// Зарежда локала на dayjs за езика; true – календарът може да е на този език (английският е вграден)
export async function loadCalendarLocale(code) {
    if (!code || code === "en") return true;
    const load = DAYJS_LOCALES[`/node_modules/dayjs/locale/${code}.js`];
    if (!load) return false;
    // Файловете с локали са UMD: заредени в браузъра, те се регистрират в глобалния dayjs –
    // даваме им същия dayjs, който ползва календарът
    globalThis.dayjs = dayjs;
    await load();
    // true само ако локалът наистина е регистриран
    return Boolean(dayjs.Ls[code]);
}
