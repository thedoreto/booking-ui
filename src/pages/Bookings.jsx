import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function Bookings() {

    const { user, loading } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [viewMode, setViewMode] = useState("active");

    if (loading) {
        return <div>Loading...</div>;
    }

    const isAdmin = user?.role === "ADMIN";

    // Същите правила като в бекенда: отказана резервация не се отказва пак,
    // а потребителят (не админ) може да откаже най-късно в деня преди настаняването
    const isCanceled = (b) => b.status === "CANCELED";
    const isPastDeadline = (b) => !isAdmin && !dayjs(b.checkInDate).isAfter(dayjs(), "day");

    const getErrorMessage = (data, fallback) => {
        if (!data) return fallback;

        return (
            data.message ||
            data.detail ||
            data.error ||
            fallback
        );
    };

    // SAME endpoints for both roles
    // backend decides what user sees
    const getEndpoint = (mode) => {

        switch (mode) {

            case "active":
                return "/bookings/active";

            case "all":
                return "/bookings/future";

            case "history":
                return "/bookings/history";

            default:
                return "/bookings/active";
        }
    };

    const loadBookings = async () => {

        try {

            const res = await api.get(getEndpoint(viewMode));

            setBookings(res.data);

        } catch (err) {

            const data = err?.response?.data;

            alert(
                "❌ " +
                getErrorMessage(data, "Failed to load bookings")
            );
        }
    };

    useEffect(() => {
        loadBookings();
    }, [viewMode]);

    const cancelBooking = async (id) => {

        if (!window.confirm("Cancel this booking?")) return;

        try {

            await api.put(`/bookings/${id}/cancel`);

            loadBookings();

        } catch (err) {

            const data = err?.response?.data;

            alert(
                "❌ " +
                getErrorMessage(data, "Cancel failed")
            );
        }
    };

    return (
        <div>

            <h2>Bookings</h2>

            {bookings.map(b => (
                <div
                    key={b.id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #ccc",
                        padding: "10px 0",
                        gap: "10px"
                    }}
                >

                    {isAdmin && (
                        <div>{b.userName}</div>
                    )}

                    <div>
                        Room {b.roomNumber} ({b.roomType})
                    </div>

                    <div>
                        {b.checkInDate} → {b.checkOutDate}
                    </div>

                    <div>{b.status}</div>

                    {viewMode !== "history" && !isCanceled(b) && (
                        isPastDeadline(b) ? (
                            <span style={{ color: "#6b7280", fontSize: "13px" }}>
                                Cancellation no longer possible
                            </span>
                        ) : (
                            <button
                                onClick={() => cancelBooking(b.id)}
                                style={{ color: "red" }}
                            >
                                Cancel
                            </button>
                        )
                    )}

                </div>
            ))}

            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px"
                }}
            >

                <Link to="/bookings/new">
                    <button>Create booking</button>
                </Link>

                <button onClick={() => setViewMode("active")}>
                    Show active
                </button>

                <button onClick={() => setViewMode("all")}>
                    Show all
                </button>

                <button onClick={() => setViewMode("history")}>
                    Show history
                </button>

            </div>

        </div>
    );
}