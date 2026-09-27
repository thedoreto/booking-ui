import { useState } from "react";
import dayjs from "dayjs";
import { styles } from "./ChatWindow.styles.js";
import { nightsText } from "./chatTexts.js";

// Предстоящите резервации на потребителя в чата: картички с бутон „Откажи“ (без LLM).
// Отказ е възможен най-късно в деня преди настаняването – бекендът го проверява отново. t – текстовете на прозореца
export default function BookingList({ bookingList, onCancel, roomTypeName, t }) {
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
                            {roomTypeName(booking.roomType)} ({t("ui.roomNumber", { number: booking.roomNumber })})
                        </div>
                        <div style={styles.roomPrice}>
                            {dayjs(booking.checkInDate).format("DD.MM.YYYY")} – {dayjs(booking.checkOutDate).format("DD.MM.YYYY")}
                            {" · "}{nightsText(t, booking.nights)}
                            {" · "}{t("ui.price", { price: Number(booking.totalPrice).toFixed(2) })}
                        </div>

                        {isCanceled ? (
                            <div style={styles.bookingCanceled}>{t("ui.canceled")}</div>
                        ) : !canCancel ? (
                            <div style={styles.bookingNote}>{t("ui.cancelNotPossible")}</div>
                        ) : status === "canceling" ? (
                            <div style={styles.bookingNote}>{t("ui.canceling")}</div>
                        ) : confirmingId === booking.id ? (
                            <div style={styles.bookingActions}>
                                <span style={styles.bookingNote}>{t("ui.cancelConfirm")}</span>
                                <button onClick={() => confirmCancel(booking.id)} style={styles.cancelBookingButton}>{t("ui.cancelYes")}</button>
                                <button onClick={() => setConfirmingId(null)} style={styles.secondaryButton}>{t("ui.cancelNo")}</button>
                            </div>
                        ) : (
                            <div style={styles.bookingActions}>
                                <button onClick={() => setConfirmingId(booking.id)} style={styles.cancelBookingButton}>{t("ui.cancelBooking")}</button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
