import { useEffect, useRef, useState } from "react";
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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendPayloadToApi(messageText, shortcutId = null) {
        if (!messageText.trim() && !shortcutId) return;

        const userMessage = { role: "user", content: messageText };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");

        try {
            const requestBody = { hotelId, userId: user.id, messages: updatedMessages };
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

            setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);

            // Проверяваме дали бекендът изисква отваряне на календара
            if (actionType === "OPEN_DATE_PICKER") {
                setIsDatePickerOpen(true);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Проблем с връзката към сървъра." }]);
        }
    }

    async function sendMessage() {
        await sendPayloadToApi(input, null);
    }

    async function handleShortcutClick(shortcut) {
        const shortcutId = shortcut.shortcutId || shortcut._id || shortcut.id;
        await sendPayloadToApi(shortcut.label, shortcutId);
    }

    // Функция, която се извиква, когато потребителят избере дати от календара
    async function handleDatesSelected(startDate, endDate) {
        setIsDatePickerOpen(false);
        await sendPayloadToApi(`Провери свободни стаи от ${startDate} до ${endDate}`);
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
        sendMessage,
        handleShortcutClick,
        handleDatesSelected
    };
}