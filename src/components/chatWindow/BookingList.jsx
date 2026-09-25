import { useState } from "react";
import dayjs from "dayjs";
import { styles } from "./ChatWindow.styles.js";

// Предстоящите резервации на потребителя в чата: картички с бутон „Откажи“ (без LLM).
// Отказ е възможен най-късно в деня преди настаняването – бекендът го проверява отново.
export default function BookingList({ bookingList, onCancel, roomTypeName }) {
    const { bookings, statusById } = bookingList;
    // Резервацията, за която е показано „Сигурни ли сте?“
    const [confirmingId, setConfirmingId] = useState(null);

    function confirmCancel(bookingId) {
        setConfirmingId(null);
        onCancel(bookingId);
    }

    return (
        <div style={styles.roomList}>
            {bookings.map(booking => {
                const status = statusById[booking.id] || "open";
                const canCancel = dayjs(booking.checkInDate).isAfter(dayjs(), "day");
                const isCanceled = status === "canceled";

                return (
                    <div
                        key={booking.id}
                        style={{ ...styles.roomCard, flexDirection: "column", alignItems: "stretch", opacity: isCanceled ? 0.6 : 1 }}
                    >
                        <div style={styles.roomTitle}>
                            {roomTypeName(booking.roomType)} (Стая №{booking.roomNumber})
                        </div>
                        <div style={styles.roomPrice}>
                            {dayjs(booking.checkInDate).format("DD.MM.YYYY")} – {dayjs(booking.checkOutDate).format("DD.MM.YYYY")}
                            {" · "}{booking.nights} {booking.nights === 1 ? "нощ" : "нощи"}
                            {" · "}{Number(booking.totalPrice).toFixed(2)} лв.
                        </div>

                        {isCanceled ? (
                            <div style={styles.bookingCanceled}>Отказана</div>
                        ) : !canCancel ? (
                            <div style={styles.bookingNote}>Отказът вече не е възможен</div>
                        ) : status === "canceling" ? (
                            <div style={styles.bookingNote}>Отказване...</div>
                        ) : confirmingId === booking.id ? (
                            <div style={styles.bookingActions}>
                                <span style={styles.bookingNote}>Сигурни ли сте?</span>
                                <button onClick={() => confirmCancel(booking.id)} style={styles.cancelBookingButton}>Да, откажи</button>
                                <button onClick={() => setConfirmingId(null)} style={styles.secondaryButton}>Не</button>
                            </div>
                        ) : (
                            <div style={styles.bookingActions}>
                                <button onClick={() => setConfirmingId(booking.id)} style={styles.cancelBookingButton}>Откажи</button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
