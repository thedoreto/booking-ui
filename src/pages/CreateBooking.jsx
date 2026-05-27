import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function CreateBooking() {

    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const [users, setUsers] = useState([]);

    const [userId, setUserId] = useState("");

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");

    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {

        if (loading) return;

        const loadData = async () => {

            try {

                if (isAdmin) {
                    const usersRes = await api.get("/users");
                    setUsers(usersRes.data);
                } else if (user?.id) {
                    setUserId(user.id);
                }

            } catch (err) {
                console.error(err);
                alert("❌ Failed to load data");
            }
        };

        loadData();

    }, [loading, isAdmin, user]);

    const checkAvailability = async () => {

        try {

            const res = await api.get("/rooms/available", {
                params: {
                    checkInDate,
                    checkOutDate
                }
            });

            setAvailableRooms(res.data);
            setSelectedRooms([]);

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.message ||
                "Invalid dates or server error"
            );
        }
    };

    const toggleRoom = (roomId) => {

        setSelectedRooms(prev =>

            prev.includes(roomId)
                ? prev.filter(id => id !== roomId)
                : [...prev, roomId]
        );
    };

    const createBooking = async () => {

        try {

            const payload = selectedRooms.map(roomId => ({
                userId,
                roomId,
                checkInDate,
                checkOutDate
            }));

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

    if (loading) return <div>Loading...</div>;

    return (
        <div>

            <h2>Create booking</h2>

            {/* USER */}
            {isAdmin ? (
                <div>
                    <label>User:</label>

                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    >
                        <option value="">Select user</option>

                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div>Logged as: {user?.email}</div>
            )}

            {/* DATES */}
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

            {/* CHECK AVAILABILITY */}
            <button
                onClick={checkAvailability}
                style={{ marginTop: "10px" }}
            >
                Check availability
            </button>

            {/* AVAILABLE ROOMS */}
            {availableRooms.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Available rooms</h3>

                    {availableRooms.map(room => (
                        <div
                            key={room.id}
                            onClick={() => toggleRoom(room.id)}
                            style={{
                                padding: "10px",
                                margin: "6px 0",
                                border: "1px solid #ccc",
                                cursor: "pointer",
                                backgroundColor: selectedRooms.includes(room.id)
                                    ? "#cce5ff"
                                    : "white"
                            }}
                        >
                            Room {room.roomNumber} ({room.type})
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE BOOKING */}
            {selectedRooms.length > 0 && (
                <button
                    onClick={createBooking}
                    style={{ marginTop: "20px" }}
                >
                    Create reservation ({selectedRooms.length})
                </button>
            )}

        </div>
    );
}