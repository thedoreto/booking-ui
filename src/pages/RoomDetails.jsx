import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function RoomDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [room, setRoom] = useState(null);
    const [roomType, setRoomType] = useState("");
    const [price, setPrice] = useState(0);
    const [roomNumber, setRoomNumber] = useState(0);

    const getErrorMessage = (data, fallback) => {
        if (!data) return fallback;

        return (
            data.message ||
            data.detail ||
            data.error ||
            fallback
        );
    };

    useEffect(() => {

        if (!isEditMode) {
            setRoom({});
            return;
        }

        fetch(`${API_URL}/rooms/${id}`)
            .then(async (res) => {

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Failed to load room")
                    );
                }

                return data;
            })
            .then(data => {

                setRoom(data);
                setRoomNumber(data.roomNumber ?? 0);
                setRoomType(data.type ?? "");
                setPrice(data.pricePerNight ?? 0);

            })
            .catch(err => {
                alert("❌ " + err.message);
            });

    }, [id]);

    if (isEditMode && !room) return <div>Loading...</div>;

    const saveRoom = () => {

        const payload = {
            roomNumber,
            type: roomType,
            pricePerNight: Number(price)
        };

        const url = isEditMode
            ? `${API_URL}/rooms/${id}`
            : `${API_URL}/rooms`;

        const method = isEditMode ? "PUT" : "POST";

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(async (res) => {

                const text = await res.text();
                const data = text ? (() => {
                    try {
                        return JSON.parse(text);
                    } catch {
                        return text;
                    }
                })() : null;

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Operation failed")
                    );
                }

                return data;
            })
            .then(() => {

                alert(
                    isEditMode
                        ? "Room updated successfully!"
                        : "Room created successfully!"
                );

                navigate("/rooms");

            })
            .catch(err => {
                alert("❌ " + err.message);
            });
    };

    const deleteRoom = () => {

        if (!window.confirm("Delete this room?")) return;

        fetch(`${API_URL}/rooms/${id}`, {
            method: "DELETE"
        })
            .then(async (res) => {

                const text = await res.text();

                const data = text ? (() => {
                    try {
                        return JSON.parse(text);
                    } catch {
                        return text;
                    }
                })() : null;

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Delete failed")
                    );
                }

                return data;
            })
            .then(() => {

                alert("Room deleted!");
                navigate("/rooms");

            })
            .catch(err => {
                alert("❌ " + err.message);
            });
    };

    return (
        <div>

            <h2>
                {isEditMode ? "Room details" : "Create new room"}
            </h2>

            <div>
                <label>Room number:</label>

                <input
                    type="number"
                    value={roomNumber}
                    onChange={(e) =>
                        setRoomNumber(Number(e.target.value))
                    }
                />
            </div>

            <div>
                <label>Room type:</label>

                <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                >
                    <option value="">Select room type</option>
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="APARTMENT">APARTMENT</option>
                </select>
            </div>

            <div>
                <label>Price:</label>

                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>

            <button onClick={saveRoom}>
                {isEditMode ? "Save" : "Create"}
            </button>

            {isEditMode && (
                <button
                    onClick={deleteRoom}
                    style={{
                        marginLeft: "10px",
                        color: "red"
                    }}
                >
                    Delete
                </button>
            )}

        </div>
    );
}