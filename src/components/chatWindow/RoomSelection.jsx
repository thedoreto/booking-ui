import { useState } from "react";
import dayjs from "dayjs";
import { styles } from "./ChatWindow.styles.js";
import { nightsText } from "./chatTexts.js";

// Списък със свободни стаи в чата: потребителят избира стаи и ги резервира без LLM; t – текстовете на прозореца
export default function RoomSelection({ selection, onBook, roomTypeName, roomImages, t }) {
    const { startDate, endDate, rooms, status } = selection;
    const [selectedIds, setSelectedIds] = useState([]);

    const nights = dayjs(endDate).diff(dayjs(startDate), "day");
    const isLocked = status === "booking" || status === "booked";
    const total = rooms
        .filter(room => selectedIds.includes(room.id))
        .reduce((sum, room) => sum + room.pricePerNight * nights, 0);

    function toggleRoom(roomId) {
        setSelectedIds(prev =>
            prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
        );
    }

    return (
        <div style={styles.roomList}>
            {rooms.map(room => (
                <label
                    key={room.id}
                    style={{
                        ...styles.roomCard,
                        borderColor: selectedIds.includes(room.id) ? "#2563eb" : "#d1d5db",
                        cursor: isLocked ? "default" : "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(room.id)}
                        disabled={isLocked}
                        onChange={() => toggleRoom(room.id)}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={styles.roomTitle}>
                            {roomTypeName(room.type)} ({t("ui.roomNumber", { number: room.roomNumber })})
                        </div>
                        <div style={styles.roomPrice}>
                            {t("ui.pricePerNight", { price: room.pricePerNight.toFixed(2) })}
                        </div>
                        <RoomImages images={roomImages(room)} />
                    </div>
                </label>
            ))}

            {status !== "booked" && (
                <button
                    onClick={() => onBook(selectedIds)}
                    disabled={selectedIds.length === 0 || isLocked}
                    style={{
                        ...styles.bookButton,
                        opacity: selectedIds.length === 0 || isLocked ? 0.5 : 1,
                        cursor: selectedIds.length === 0 || isLocked ? "default" : "pointer"
                    }}
                >
                    {status === "booking"
                        ? t("ui.booking")
                        : selectedIds.length === 0
                            ? t("ui.selectRoom")
                            : t("ui.bookButton", { nights: nightsText(t, nights), total: total.toFixed(2) })}
                </button>
            )}
        </div>
    );
}

// До 3 малки снимки на стаята – само за красота: клик върху тях не прави нищо (и не маркира стаята).
// Снимка, която не се зареди, не се показва.
function RoomImages({ images }) {
    const [failedUrls, setFailedUrls] = useState([]);
    const visible = images.filter(image => !failedUrls.includes(image.url));
    if (visible.length === 0) return null;

    return (
        // Картичката е <label> – без preventDefault кликът върху снимка би маркирал стаята
        <div style={styles.roomImages} onClick={(event) => event.preventDefault()}>
            {visible.map(image => (
                <img
                    key={image.url}
                    src={image.url}
                    alt={image.title || ""}
                    loading="lazy"
                    style={styles.roomImage}
                    onError={() => setFailedUrls(prev => [...prev, image.url])}
                />
            ))}
        </div>
    );
}
