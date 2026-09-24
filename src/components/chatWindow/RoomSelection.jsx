import { useState } from "react";
import dayjs from "dayjs";
import { styles } from "./ChatWindow.styles.js";

const ROOM_TYPES = {
    SINGLE: "Единична стая",
    DOUBLE: "Двойна стая",
    APARTMENT: "Апартамент"
};

// Списък със свободни стаи в чата: потребителят избира стаи и ги резервира без LLM
export default function RoomSelection({ selection, onBook }) {
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
                            {ROOM_TYPES[room.type] || room.type} (Стая №{room.roomNumber})
                        </div>
                        <div style={styles.roomPrice}>
                            {room.pricePerNight.toFixed(2)} лв. на нощ
                        </div>
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
                        ? "Резервиране..."
                        : selectedIds.length === 0
                            ? "Изберете стая"
                            : `Резервирай (${nights} ${nights === 1 ? "нощ" : "нощи"}, ${total.toFixed(2)} лв.)`}
                </button>
            )}
        </div>
    );
}
