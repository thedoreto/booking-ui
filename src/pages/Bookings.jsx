import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Bookings() {

    const [bookings, setBookings] = useState([]);
    const [viewMode, setViewMode] = useState("active");

    const getErrorMessage = (data, fallback) => {
        if (!data) return fallback;

        return (
            data.message ||
            data.detail ||
            data.error ||
            fallback
        );
    };

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

    const loadBookings = () => {

        fetch(`${API_URL}${getEndpoint(viewMode)}`)
            .then(async (res) => {

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Failed to load bookings")
                    );
                }

                return data;
            })
            .then(data => {
                setBookings(data);
            })
            .catch(err => {
                alert("❌ " + err.message);
            });
    };

    useEffect(() => {
        loadBookings();
    }, [viewMode]);

    const cancelBooking = (id) => {

        if (!window.confirm("Cancel this booking?")) return;

        fetch(`${API_URL}/bookings/${id}/cancel`, {
            method: "PUT"
        })
            .then(async (res) => {

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Cancel failed")
                    );
                }

                return data;
            })
            .then(() => {
                loadBookings();
            })
            .catch(err => {
                alert("❌ " + err.message);
            });
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

                    <div>{b.customerName}</div>

                    <div>
                        Room {b.roomNumber} ({b.roomType})
                    </div>

                    <div>
                        {b.checkInDate} → {b.checkOutDate}
                    </div>

                    <div>{b.status}</div>

                    {viewMode !== "history" && (
                        <button
                            onClick={() => cancelBooking(b.id)}
                            style={{ color: "red" }}
                        >
                            Cancel
                        </button>
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