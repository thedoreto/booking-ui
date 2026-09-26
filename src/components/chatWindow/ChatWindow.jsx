import { useState } from "react";
import { useChat } from "./useChat.js";
import { styles } from "./ChatWindow.styles.js";
import DateSelectorModal from "./DateSelectorModal.jsx"; // 1. Добави този импорт
import RoomSelection from "./RoomSelection.jsx";
import BookingList from "./BookingList.jsx";

// Хотелът идва от VITE_HOTEL_ID (.env локално, env променлива в Render; вгражда се при build)
const DEFAULT_HOTEL_ID = import.meta.env.VITE_HOTEL_ID || "seven_stars";

export default function ChatWindow({ user, hotelId = DEFAULT_HOTEL_ID }) {
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
        datePickerPrefill,
        roomTypes,
        roomTypeName,
        roomImages,
        sendMessage,
        handleShortcutClick,
        handleDatesSelected,    // 2. И това
        handleBookRooms,
        handleCancelBooking
    } = useChat(user, hotelId);
    const [isMaximized, setIsMaximized] = useState(false);
    const maximized = isMaximized && !isMinimized;

    const shortcutsStyle = maximized
        ? { ...styles.shortcutsContainer, ...styles.shortcutsContainerExpanded }
        : styles.shortcutsContainer;

    const toggleMinimized = () => {
        setIsMinimized(!isMinimized);
        setIsMaximized(false);
    };

    return (
        <div style={{
            ...styles.wrapper,
            ...(maximized ? styles.wrapperMaximized : {}),
            height: isMinimized ? "70px" : maximized ? "auto" : "560px"
        }}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.onlineDot}></div>
                    <div>
                        <div style={styles.title}>AI Assistant</div>
                        <div style={styles.onlineText}>Online</div>
                    </div>
                </div>
                <div style={styles.headerButtons}>
                    {!isMinimized && (
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            style={styles.maximizeButton}
                            title={isMaximized ? "Намали" : "Цял екран"}
                            aria-label={isMaximized ? "Намали" : "Цял екран"}
                        >
                            {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                        </button>
                    )}
                    <button onClick={toggleMinimized} style={styles.minimizeButton}>
                        {isMinimized ? "▢" : "—"}
                    </button>
                </div>
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
                                    {msg.roomSelection && (
                                        <RoomSelection
                                            selection={msg.roomSelection}
                                            onBook={(roomIds) => handleBookRooms(index, roomIds)}
                                            roomTypeName={roomTypeName}
                                            roomImages={roomImages}
                                        />
                                    )}
                                    {msg.bookingList && (
                                        <BookingList
                                            bookingList={msg.bookingList}
                                            onCancel={(bookingId) => handleCancelBooking(index, bookingId)}
                                            roomTypeName={roomTypeName}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef}></div>
                    </div>

                    {shortcuts.length > 0 && (
                        <div style={shortcutsStyle}>
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
                    initialStartDate={datePickerPrefill?.startDate}
                    initialEndDate={datePickerPrefill?.endDate}
                    initialRoomType={datePickerPrefill?.roomType}
                    roomTypes={roomTypes}
                />
            )}
        </div>
    );
}

// Четири ъгъла навън – цял екран
function MaximizeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
    );
}

// Четири ъгъла навътре – обратно към малкия прозорец
function RestoreIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        </svg>
    );
}
