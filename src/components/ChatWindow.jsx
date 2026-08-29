import { useEffect, useRef, useState } from "react";
import aiApi from "../api/aiApi";

export default function ChatWindow({ user, hotelId = "seven_stars" }) {

    const [isMinimized, setIsMinimized] = useState(false);
    const [shortcuts, setShortcuts] = useState([]);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Здрасти, ${user.name}. С какво мога да помогна днес?`
        }
    ]);

    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // ✔ Зареждане на бутоните (shortcuts) при отваряне на чата
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

    // ✔ auto scroll надолу
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    // Обща функция със стандартни параметри
    async function sendPayloadToApi(messageText, shortcutId = null) {
        if (!messageText.trim() && !shortcutId) return;

        const userMessage = {
            role: "user",
            content: messageText
        };

        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");

        try {
            const requestBody = {
                hotelId,
                messages: updatedMessages
            };

            if (shortcutId) {
                requestBody.shortcutId = shortcutId;
            }

            console.log("📤 Изпращане към API:", requestBody);

            const response = await aiApi.post("/api/chat", requestBody);
            const data = response.data;

            let assistantContent;

            if (data?.reply && typeof data.reply === "object") {
                const reply = data.reply;

                if (reply.type === "ok") {
                    assistantContent = JSON.stringify(reply.data, null, 2);
                } else if (reply.type === "error") {
                    assistantContent = reply.data || "Грешка";
                } else {
                    assistantContent = JSON.stringify(reply);
                }
            } else {
                assistantContent = data.reply;
            }

            const assistantMessage = {
                role: "assistant",
                content: assistantContent
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "Проблем с връзката към сървъра."
                }
            ]);
        }
    }

    async function sendMessage() {
        await sendPayloadToApi(input, null);
    }

    async function handleShortcutClick(shortcut) {
        await sendPayloadToApi(shortcut.label, shortcut.shortcutId);
    }

    return (
        <div
            style={{
                ...styles.wrapper,
                height: isMinimized ? "70px" : "560px"
            }}
        >
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.onlineDot}></div>
                    <div>
                        <div style={styles.title}>
                            AI Assistant
                        </div>
                        <div style={styles.onlineText}>
                            Online
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    style={styles.minimizeButton}
                >
                    {isMinimized ? "▢" : "—"}
                </button>
            </div>

            {!isMinimized && (
                <>
                    <div style={styles.messages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.messageRow,
                                    justifyContent:
                                        msg.role === "user"
                                            ? "flex-end"
                                            : "flex-start"
                                }}
                            >
                                <div
                                    style={{
                                        ...styles.messageBubble,
                                        backgroundColor:
                                            msg.role === "user"
                                                ? "#214daf"
                                                : "#e5e7eb",
                                        color:
                                            msg.role === "user"
                                                ? "white"
                                                : "#111827"
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef}></div>
                    </div>

                    {shortcuts.length > 0 && (
                        <div style={styles.shortcutsContainer}>
                            {shortcuts.map((sc) => (
                                <button
                                    key={sc.shortcutId || sc._id}
                                    onClick={() => handleShortcutClick(sc)}
                                    style={styles.shortcutChip}
                                >
                                    {sc.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={styles.inputContainer}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Напиши съобщение..."
                            style={styles.input}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage();
                                }
                            }}
                        />

                        <button
                            onClick={sendMessage}
                            style={styles.button}
                        >
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    wrapper: {
        width: "100%",
        maxWidth: "420px",
        position: "fixed",
        bottom: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "22px",
        overflow: "hidden",
        backgroundColor: "white",
        boxShadow: "0 10px 40px rgba(0,0,0,0.18)",
        border: "1px solid #e5e7eb",
        transition: "all 0.25s ease"
    },

    header: {
        height: "70px",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1c4498",
        color: "white"
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    onlineDot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: "#00ff66",
        boxShadow: "0 0 12px #00ff66"
    },

    title: {
        fontSize: "16px",
        fontWeight: "600"
    },

    onlineText: {
        fontSize: "12px",
        color: "#10e681",
        marginTop: "2px"
    },

    minimizeButton: {
        border: "none",
        background: "transparent",
        color: "white",
        fontSize: "22px",
        cursor: "pointer"
    },

    messages: {
        flex: 1,
        overflowY: "auto",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "#f3f4f6"
    },

    messageRow: {
        display: "flex"
    },

    messageBubble: {
        padding: "12px 15px",
        borderRadius: "16px",
        maxWidth: "78%",
        lineHeight: "1.45",
        fontSize: "14px",
        wordBreak: "break-word",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        whiteSpace: "pre-line"
    },

    shortcutsContainer: {
        display: "flex",
        gap: "8px",
        padding: "8px 14px",
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        overflowX: "auto",
        whiteSpace: "nowrap"
    },

    shortcutChip: {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        borderRadius: "12px",
        padding: "6px 12px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background-color 0.2s"
    },

    inputContainer: {
        display: "flex",
        padding: "14px",
        gap: "10px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "white"
    },

    input: {
        flex: 1,
        border: "1px solid #d1d5db",
        borderRadius: "14px",
        padding: "12px 14px",
        fontSize: "14px",
        outline: "none"
    },

    button: {
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        padding: "0 18px",
        borderRadius: "14px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600"
    }
};