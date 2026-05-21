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

    const [images, setImages] = useState([]);

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

        if (!isEditMode) return;

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
            .then(async (data) => {

                setRoom(data);

                setRoomNumber(data.roomNumber ?? 0);
                setRoomType(data.type ?? "");
                setPrice(data.pricePerNight ?? 0);

                // LOAD IMAGES
                if (data.imageIds?.length) {

                    const imagesData = await Promise.all(
                        data.imageIds.map(imageId =>
                            fetch(`${API_URL}/images/${imageId}`)
                                .then(res => res.json())
                        )
                    );

                    setImages(imagesData);
                }

            })
            .catch(err => {
                alert("❌ " + err.message);
            });

    }, [id, isEditMode]);

    if (isEditMode && !room) {
        return <div>Loading...</div>;
    }

    const saveRoom = () => {

        const payload = {
            roomNumber,
            type: roomType,
            pricePerNight: Number(price),
            imageIds: room?.imageIds ?? []
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

            {/* GALLERY */}
            {isEditMode && images.length > 0 && (
                <div style={{ marginTop: "30px" }}>

                    <h3>Images</h3>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: "12px"
                        }}
                    >
                        {images.map((img, idx) => (
                            <div
                                key={img.id ?? idx}
                                style={{
                                    overflow: "hidden",
                                    borderRadius: "12px",
                                    boxShadow:
                                        "0 4px 12px rgba(0,0,0,0.1)",
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                    background: "white"
                                }}
                                onMouseOver={(e) =>
                                    (e.currentTarget.style.transform =
                                        "scale(1.03)")
                                }
                                onMouseOut={(e) =>
                                    (e.currentTarget.style.transform =
                                        "scale(1)")
                                }
                            >
                                <img
                                    src={img.url}
                                    alt={`room-${idx}`}
                                    style={{
                                        width: "100%",
                                        height: "140px",
                                        objectFit: "cover"
                                    }}
                                    loading="lazy"
                                />

                                <div
                                    style={{
                                        padding: "10px",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}
                                >
                                    {img.title}
                                </div>

                            </div>
                        ))}
                    </div>

                </div>
            )}

        </div>
    );
}