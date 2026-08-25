import { useEffect, useRef, useState } from "react";
import aiApi from "../api/aiApi";

export default function ChatWindow({ user }) {

    const [isMinimized, setIsMinimized] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Здрасти, ${user.name}. С какво мога да помогна днес?`
        }
    ]);

    const [input, setInput] = useState("");

    const messagesEndRef = useRef(null);

    // ✔ auto scroll надолу
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    async function sendMessage() {

        if (!input.trim()) return;

        const userMessage = {
            role: "user",
            content: input
        };

        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");

        try {

            const response = await aiApi.post("/api/chat", {
                messages: updatedMessages
            });

            const data = response.data;

            // ✅ FIX: support new structure { reply: { type, data } }
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
                // fallback for old string format
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

    return (

        <div
            style={{
                ...styles.wrapper,
                height: isMinimized ? "70px" : "520px"
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