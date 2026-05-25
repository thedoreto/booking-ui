import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function CreateBooking() {

    const navigate = useNavigate();

    const { user, loading } = useAuth();

    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [userId, setUserId] = useState("");
    const [roomId, setRoomId] = useState("");

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {

        if (loading) return;

        const loadData = async () => {

            try {

                // 🔥 rooms for everybody
                const roomsRes = await api.get("/rooms");
                setRooms(roomsRes.data);

                // 🔥 admin -> load users dropdown
                if (isAdmin) {

                    const usersRes = await api.get("/users");
                    setUsers(usersRes.data);

                } else if (user?.id) {

                    // 🔥 normal user -> auto select self
                    setUserId(user.id);
                }

            } catch (err) {

                console.error(err);

                alert("❌ Failed to load data");
            }
        };

        loadData();

    }, [loading, isAdmin, user]);

    const createBooking = async () => {

        try {

            const payload = {
                userId,
                roomId,
                checkInDate,
                checkOutDate
            };

            await api.post("/bookings", payload);

            alert("Booking created!");

            navigate("/bookings");

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.message ||
                "Create booking failed"
            );
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>

            <h2>Create booking</h2>

            {/* ADMIN ONLY */}
            {isAdmin && (
                <div>
                    <label>User:</label>

                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    >
                        <option value="">Select user</option>

                        {users.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.email})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* NORMAL USER */}
            {!isAdmin && (
                <div style={{ marginBottom: "10px" }}>
                    Logged as: {user?.email}
                </div>
            )}

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