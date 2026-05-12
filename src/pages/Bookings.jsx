import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [showAll, setShowAll] = useState(false);

    const loadBookings = () => {
        fetch(`${API_URL}/bookings`)
            .then(res => res.json())
            .then(data => {
                const filtered = showAll
                    ? data
                    : data.filter(b => b.status === "CONFIRMED");

                setBookings(filtered);
            });
    };

    useEffect(() => {
        loadBookings();
    }, [showAll]);

    const cancelBooking = (id) => {
        if (!window.confirm("Cancel this booking?")) return;

        fetch(`${API_URL}/bookings/${id}/cancel`, {
            method: "PUT"
        })
            .then(res => {
                if (!res.ok) throw new Error("Cancel failed");
                loadBookings();
            })
            .catch(err => alert(err.message));
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
                    <div>Room {b.roomNumber} ({b.roomType})</div>
                    <div>{b.checkInDate} → {b.checkOutDate}</div>
                    <div>{b.status}</div>

                    <button
                        onClick={() => cancelBooking(b.id)}
                        style={{ color: "red" }}
                    >
                        Cancel
                    </button>
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

                <button onClick={() => setShowAll(prev => !prev)}>
                    {showAll ? "Show confirmed only" : "Show all bookings"}
                </button>
            </div>
        </div>
    );
}