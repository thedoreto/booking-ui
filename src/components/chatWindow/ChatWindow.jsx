import { useChat } from "./useChat.js";
import { styles } from "./ChatWindow.styles.js";
import DateSelectorModal from "./DateSelectorModal.jsx"; // 1. Добави този импорт

export default function ChatWindow({ user, hotelId = "seven_stars" }) {//40_robbers
    const {
        isMinimized,
        setIsMinimized,
        shortcuts,
        messages,
        input,
        setInput,
        messagesEndRef,
        isDatePickerOpen,       // 2. Вземи това от хука
        setIsDatePickerOpen,    // 2. И това
        sendMessage,
        handleShortcutClick,
        handleDatesSelected     // 2. И това
    } = useChat(user, hotelId);

    return (
        <div style={{ ...styles.wrapper, height: isMinimized ? "70px" : "560px" }}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.onlineDot}></div>
                    <div>
                        <div style={styles.title}>AI Assistant</div>
                        <div style={styles.onlineText}>Online</div>
                    </div>
                </div>
                <button onClick={() => setIsMinimized(!isMinimized)} style={styles.minimizeButton}>
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
                                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                                }}
                            >
                                <div
                                    style={{
                                        ...styles.messageBubble,
                                        backgroundColor: msg.role === "user" ? "#214daf" : "#e5e7eb",
                                        color: msg.role === "user" ? "white" : "#111827"
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
                                if (e.key === "Enter") sendMessage();
                            }}
                        />
                        <button onClick={sendMessage} style={styles.button}>
                            Send
                        </button>
                    </div>
                </>
            )}

            {/* 3. Добави модалния прозорец най-отдолу */}
            {isDatePickerOpen && (
                <DateSelectorModal
                    isOpen={isDatePickerOpen}
                    onClose={() => setIsDatePickerOpen(false)}
                    onSelectDates={handleDatesSelected}
                />
            )}
        </div>
    );
}