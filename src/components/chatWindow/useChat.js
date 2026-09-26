import { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import aiApi from "../../api/aiApi.js";

// Новата резервация е едно действие в логовете на booking-ai (flowId), докато гостът не резервира.
// След толкова време без стъпка следващото търсене започва ново действие.
const BOOKING_FLOW_IDLE_MS = 30 * 60 * 1000;
// Колко снимки на стая се показват в списъка със свободни стаи
const MAX_ROOM_IMAGES = 3;

export function useChat(user, hotelId) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [shortcuts, setShortcuts] = useState([]);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: user
                ? `Здрасти, ${user.name}. С какво мога да помогна днес?`
                : "Здравейте! С какво мога да помогна днес?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    // Дати и тип стая, казани в чата ({ startDate?, endDate?, roomType? }), с които календарът се отваря попълнен
    const [datePickerPrefill, setDatePickerPrefill] = useState(null);
    // Типовете стаи на хотела ([{ code, name }]) – идват от бекенда
    const [roomTypes, setRoomTypes] = useState([]);
    // Подменюто с типове стаи под бутона „Нова резервация“
    const [isRoomTypeMenuOpen, setIsRoomTypeMenuOpen] = useState(false);
    const messagesEndRef = useRef(null);
    // Текущата заявка за типовете стаи – за да не пращаме няколко едновременно
    const roomTypesRequest = useRef(null);
    // Снимките на хотела по id ({ [id]: { url, title } }) – зареждат се веднъж, при първия списък със стаи
    const [imagesById, setImagesById] = useState({});
    const imagesRequested = useRef(false);
    // Текущата нова резервация ({ id, at }) – flowId от бекенда, връща се със следващите стъпки
    const bookingFlow = useRef(null);

    function currentBookingFlowId() {
        const flow = bookingFlow.current;
        return flow && Date.now() - flow.at < BOOKING_FLOW_IDLE_MS ? flow.id : null;
    }

    function rememberBookingFlow(flowId) {
        if (flowId) bookingFlow.current = { id: flowId, at: Date.now() };
    }

    useEffect(() => {
        async function fetchShortcuts() {
            try {
                // Кои бутони вижда гостът, решава booking-ai (guest.isActive на бутона)
                const response = await aiApi.get("/api/shortcuts", {
                    params: { hotelId, userId: user?.id }
                });
                if (response.data && Array.isArray(response.data)) {
                    setShortcuts(response.data);
                }
            } catch (error) {
                console.error("Грешка при зареждане на бутоните:", error);
            }
        }
        fetchShortcuts();
        // ChatWindow се създава наново при вход/изход (key), затова user не се сменя тук
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    // Зарежда типовете стаи. Вика се и повторно, докато списъкът е празен: при първото
    // зареждане бекендът може още да спи (Render free план) и да върне празен списък.
    function fetchRoomTypes() {
        if (roomTypesRequest.current) return;
        roomTypesRequest.current = aiApi.get("/api/rooms/types", { params: { hotelId } })
            .then(response => {
                if (Array.isArray(response.data)) {
                    setRoomTypes(response.data);
                }
            })
            .catch(error => console.error("Грешка при зареждане на типовете стаи:", error))
            .finally(() => { roomTypesRequest.current = null; });
    }

    function fetchRoomTypesIfMissing() {
        if (roomTypes.length === 0) fetchRoomTypes();
    }

    useEffect(() => {
        fetchRoomTypes();
        // fetchRoomTypes е нова функция при всеки render – зареждаме наново само при смяна на хотела
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    // Всички снимки с една заявка към booking-system (GET /images); после всяка стая си взима своите по imageIds.
    // Нарочно без api.js: той при 401 пренасочва към вход, а снимките не бива да прекъсват чата.
    // Без вход или при грешка стаите просто се показват без снимки.
    // Снимка, качена след зареждането, се вижда след презареждане на страницата.
    function loadImagesOnce() {
        if (imagesRequested.current) return;
        const token = localStorage.getItem("token");
        if (!token) return;
        imagesRequested.current = true;
        axios.get("/images", {
            baseURL: import.meta.env.VITE_API_URL,
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                if (!Array.isArray(response.data)) return;
                const byId = {};
                for (const image of response.data) {
                    if (image?.id && typeof image.url === "string" && image.url.startsWith("https://")) {
                        byId[image.id] = { url: image.url, title: image.title };
                    }
                }
                setImagesById(byId);
            })
            .catch(error => {
                // При следващия списък със стаи се опитва отново (бекендът може да е спял)
                imagesRequested.current = false;
                console.error("Грешка при зареждане на снимките:", error);
            });
    }

    // До MAX_ROOM_IMAGES снимки на стаята, в реда от imageIds; липсващите се пропускат
    function roomImages(room) {
        return (room?.imageIds || [])
            .map(id => imagesById[id])
            .filter(Boolean)
            .slice(0, MAX_ROOM_IMAGES);
    }

    function roomTypeName(code) {
        return roomTypes.find(t => t.code === code)?.name || code;
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendPayloadToApi(messageText, shortcutId = null) {
        if (!messageText.trim() && !shortcutId) return;

        const userMessage = { role: "user", content: messageText };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");

        try {
            // Към бекенда пращаме само role/content, без данните за UI (списъци със стаи и т.н.)
            const history = updatedMessages.map(({ role, content }) => ({ role, content }));
            const requestBody = { hotelId, userId: user?.id, messages: history };
            if (shortcutId) requestBody.shortcutId = shortcutId;
            // Ако асистентът отвори календара, това продължава започнатата резервация
            const flowId = currentBookingFlowId();
            if (flowId) requestBody.flowId = flowId;

            const response = await aiApi.post("/api/chat", requestBody);
            const data = response.data;
            let assistantContent;

            // Обработка на отговора спрямо новия структурирен формат от бекенда
            const responseText = data?.response || data?.reply || data;
            const actionType = data?.actionType;

            if (typeof responseText === "object" && responseText !== null) {
                if (responseText.type === "ok") {
                    assistantContent = JSON.stringify(responseText.data, null, 2);
                } else if (responseText.type === "error") {
                    assistantContent = responseText.data || "Грешка";
                } else {
                    assistantContent = JSON.stringify(responseText);
                }
            } else {
                assistantContent = responseText;
            }

            addAssistantMessage(assistantContent, actionType, data?.data);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Проблем с връзката към сървъра." }]);
        }
    }

    async function sendMessage() {
        await sendPayloadToApi(input, null);
    }

    async function handleShortcutClick(shortcut) {
        // Бутон за нова резервация – отваря календара директно, без бекенд и LLM.
        // Ако хотелът има типове стаи, първо показва подменю за избор на тип.
        if (shortcut.actionType === "open_date_picker") {
            if (roomTypes.length > 0) {
                setIsRoomTypeMenuOpen(open => !open);
            } else {
                // Календарът се отваря веднага, а бутоните за тип се появяват в него, щом типовете се заредят
                openDatePicker(null);
            }
            return;
        }

        setIsRoomTypeMenuOpen(false);

        // Бутон „Моите резервации“ – картички с бутон „Откажи“, без LLM
        if (shortcut.actionType === "my_bookings") {
            await showMyBookings(shortcut.label);
            return;
        }

        const shortcutId = shortcut.shortcutId || shortcut._id || shortcut.id;
        await sendPayloadToApi(shortcut.label, shortcutId);
    }

    // Добавя отговор на асистента и изпълнява действието за UI, ако има такова
    function addAssistantMessage(content, actionType, actionData) {
        const message = { role: "assistant", content };

        // Списък със свободни стаи – показваме го с избор и бутон за резервация
        if (actionType === "SELECT_ROOMS" && actionData?.rooms?.length) {
            message.roomSelection = { ...actionData, status: "open" };
            if (actionData.rooms.some(room => room.imageIds?.length)) loadImagesOnce();
        }

        // Предстоящи резервации – картички с бутон „Откажи“
        // flowId – отказите от този списък са стъпки в едно действие в логовете
        if (actionType === "MY_BOOKINGS" && actionData?.bookings?.length) {
            message.bookingList = { bookings: actionData.bookings, statusById: {}, flowId: actionData.flowId };
        }

        setMessages(prev => [...prev, message]);

        // Проверяваме дали бекендът изисква отваряне на календара
        if (actionType === "OPEN_DATE_PICKER") {
            rememberBookingFlow(actionData?.flowId);
            fetchRoomTypesIfMissing();
            setDatePickerPrefill(actionData || null);
            setIsDatePickerOpen(true);
        }
    }

    // roomType – код на тип стая от подменюто, или null за всички типове
    function openDatePicker(roomType) {
        fetchRoomTypesIfMissing();
        setIsRoomTypeMenuOpen(false);
        setDatePickerPrefill(roomType ? { roomType } : null);
        setIsDatePickerOpen(true);
    }

    function setRoomSelectionStatus(messageIndex, status) {
        setMessages(prev => prev.map((msg, i) =>
            i === messageIndex && msg.roomSelection
                ? { ...msg, roomSelection: { ...msg.roomSelection, status } }
                : msg
        ));
    }

    // Функция, която се извиква, когато потребителят избере дати от календара.
    // Свободните стаи идват директно от бекенда, без LLM.
    // roomType (SINGLE/DOUBLE/APARTMENT) е по избор – null търси всички типове
    async function handleDatesSelected(startDate, endDate, roomType = null) {
        setIsDatePickerOpen(false);
        const typeLabel = roomType ? ` (${roomTypeName(roomType)})` : "";
        setMessages(prev => [...prev, {
            role: "user",
            content: `Свободни стаи от ${dayjs(startDate).format("DD.MM.YYYY")} до ${dayjs(endDate).format("DD.MM.YYYY")}${typeLabel}`
        }]);

        try {
            const response = await aiApi.post("/api/rooms/available", {
                hotelId, userId: user?.id, startDate, endDate, roomType, flowId: currentBookingFlowId()
            });
            rememberBookingFlow(response.data?.data?.flowId);
            addAssistantMessage(response.data?.reply, response.data?.actionType, response.data?.data);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Проблем с връзката към сървъра." }]);
        }
    }

    async function showMyBookings(label) {
        setMessages(prev => [...prev, { role: "user", content: label || "Моите резервации" }]);
        try {
            const response = await aiApi.post("/api/bookings/mine", { hotelId, userId: user?.id });
            addAssistantMessage(response.data?.reply, response.data?.actionType, response.data?.data);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Проблем с връзката към сървъра." }]);
        }
    }

    // status: "open" | "canceling" | "canceled" за резервация bookingId в съобщение messageIndex
    function setBookingStatus(messageIndex, bookingId, status) {
        setMessages(prev => prev.map((msg, i) =>
            i === messageIndex && msg.bookingList
                ? { ...msg, bookingList: { ...msg.bookingList, statusById: { ...msg.bookingList.statusById, [bookingId]: status } } }
                : msg
        ));
    }

    // Отказва резервация от картичка в съобщение messageIndex, без LLM
    async function handleCancelBooking(messageIndex, bookingId) {
        setBookingStatus(messageIndex, bookingId, "canceling");
        try {
            const flowId = messages[messageIndex]?.bookingList?.flowId;
            const response = await aiApi.post("/api/bookings/cancel", { hotelId, userId: user?.id, bookingId, flowId });
            const canceled = response.data?.actionType === "BOOKING_CANCELED";
            setBookingStatus(messageIndex, bookingId, canceled ? "canceled" : "open");
            addAssistantMessage(response.data?.reply, response.data?.actionType, response.data?.data);
        } catch {
            setBookingStatus(messageIndex, bookingId, "open");
            setMessages(prev => [...prev, { role: "assistant", content: "Проблем с връзката към сървъра." }]);
        }
    }

    // Резервира избраните стаи от списъка в съобщение messageIndex, без LLM
    async function handleBookRooms(messageIndex, roomIds) {
        const selection = messages[messageIndex]?.roomSelection;
        if (!selection || roomIds.length === 0) return;

        setRoomSelectionStatus(messageIndex, "booking");
        try {
            const response = await aiApi.post("/api/bookings", {
                hotelId,
                userId: user?.id,
                startDate: selection.startDate,
                endDate: selection.endDate,
                roomIds,
                flowId: selection.flowId || currentBookingFlowId()
            });
            const booked = response.data?.actionType === "BOOKING_CONFIRMED";
            // След успешна резервация следващото търсене е ново действие
            if (booked) {
                bookingFlow.current = null;
            } else {
                rememberBookingFlow(selection.flowId);
            }
            setRoomSelectionStatus(messageIndex, booked ? "booked" : "open");
            addAssistantMessage(response.data?.reply, response.data?.actionType, response.data?.data);
        } catch {
            setRoomSelectionStatus(messageIndex, "open");
            setMessages(prev => [...prev, { role: "assistant", content: "Проблем с връзката към сървъра." }]);
        }
    }

    return {
        isMinimized,
        setIsMinimized,
        shortcuts,
        messages,
        input,
        setInput,
        messagesEndRef,
        isDatePickerOpen,
        setIsDatePickerOpen,
        datePickerPrefill,
        roomTypes,
        roomTypeName,
        roomImages,
        isRoomTypeMenuOpen,
        openDatePicker,
        sendMessage,
        handleShortcutClick,
        handleDatesSelected,
        handleBookRooms,
        handleCancelBooking
    };
}