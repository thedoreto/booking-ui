import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import aiApi from "../../api/aiApi.js";

export function useChat(user, hotelId) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [shortcuts, setShortcuts] = useState([]);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Здрасти, ${user.name}. С какво мога да помогна днес?`
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

    useEffect(() => {
        async function fetchShortcuts() {
            try {
                const response = await aiApi.get("/api/shortcuts", {
                    params: { hotelId }
                });
                if (response.data && Array.isArray(response.data)) {
                    setShortcuts(response.data);
                }
            } catch (error) {
                console.error("Грешка при зареждане на бутоните:", error);
            }
        }
        fetchShortcuts();
    }, [hotelId]);

    useEffect(() => {
        async function fetchRoomTypes() {
            try {
                const response = await aiApi.get("/api/rooms/types", {
                    params: { hotelId }
                });
                if (Array.isArray(response.data)) {
                    setRoomTypes(response.data);
                }
            } catch (error) {
                console.error("Грешка при зареждане на типовете стаи:", error);
            }
        }
        fetchRoomTypes();
    }, [hotelId]);

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
            const requestBody = { hotelId, userId: user.id, messages: history };
            if (shortcutId) requestBody.shortcutId = shortcutId;

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
                openDatePicker(null);
            }
            return;
        }

        setIsRoomTypeMenuOpen(false);
        const shortcutId = shortcut.shortcutId || shortcut._id || shortcut.id;
        await sendPayloadToApi(shortcut.label, shortcutId);
    }

    // Добавя отговор на асистента и изпълнява действието за UI, ако има такова
    function addAssistantMessage(content, actionType, actionData) {
        const message = { role: "assistant", content };

        // Списък със свободни стаи – показваме го с избор и бутон за резервация
        if (actionType === "SELECT_ROOMS" && actionData?.rooms?.length) {
            message.roomSelection = { ...actionData, status: "open" };
        }

        setMessages(prev => [...prev, message]);

        // Проверяваме дали бекендът изисква отваряне на календара
        if (actionType === "OPEN_DATE_PICKER") {
            setDatePickerPrefill(actionData || null);
            setIsDatePickerOpen(true);
        }
    }

    // roomType – код на тип стая от подменюто, или null за всички типове
    function openDatePicker(roomType) {
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
                hotelId, userId: user.id, startDate, endDate, roomType
            });
            addAssistantMessage(response.data?.reply, response.data?.actionType, response.data?.data);
        } catch {
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
                userId: user.id,
                startDate: selection.startDate,
                endDate: selection.endDate,
                roomIds
            });
            const booked = response.data?.actionType === "BOOKING_CONFIRMED";
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
        isRoomTypeMenuOpen,
        openDatePicker,
        sendMessage,
        handleShortcutClick,
        handleDatesSelected,
        handleBookRooms
    };
}