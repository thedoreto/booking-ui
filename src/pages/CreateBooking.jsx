import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateBooking() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [userId, setUserId] = useState("");
    const [roomId, setRoomId] = useState("");

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/users`)
            .then(res => res.json())
            .then(data => setUsers(data));

        fetch(`${API_URL}/rooms`)
            .then(res => res.json())
            .then(data => setRooms(data));
    }, []);

    const createBooking = () => {
        const payload = {
            userId,
            roomId,
            checkInDate,
            checkOutDate
        };

        fetch(`${API_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(async (res) => {
                const text = await res.text();

                if (!res.ok) {
                    throw new Error(text || "Create booking failed");
                }

                return text ? JSON.parse(text) : null;
            })
            .then(() => {
                alert("Booking created!");
                navigate("/bookings");
            })
            .catch(err => {
                alert(err.message);
            });
    };

    return (
        <div>
            <h2>Create booking</h2>

            <div>
                <label>User:</label>

                <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                >
                    <option value="">Select user</option>

                    {users.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Room:</label>

                <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                >
                    <option value="">Select room</option>

                    {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                            Room {r.roomNumber} ({r.type})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Check-in:</label>

                <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                />
            </div>

            <div>
                <label>Check-out:</label>

                <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                />
            </div>

            <button
                onClick={createBooking}
                style={{ marginTop: "10px" }}
            >
                Create booking
            </button>
        </div>
    );
}