import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function RoomDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [room, setRoom] = useState(null);
    const [roomType, setRoomType] = useState("");
    const [price, setPrice] = useState(0);
    const [roomNumber, setRoomNumber] = useState(0);

    const [imageIds, setImageIds] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {

        // ✔ CREATE MODE
        if (!isEditMode) {
            setRoom({});
            return;
        }

        // ✔ EDIT MODE
        fetch(`${API_URL}/rooms/${id}`)
            .then(res => res.json())
            .then(data => {

                setRoom(data);

                setRoomNumber(data.roomNumber ?? 0);
                setRoomType(data.type ?? "");
                setPrice(data.pricePerNight ?? 0);

                const ids = data.imageIds ?? [];

                setImageIds(ids);

                loadImages(ids);
            })
            .catch(err => {
                alert("❌ " + err.message);
            });

    }, [id, isEditMode]);

    const loadImages = async (ids) => {

        if (!ids || ids.length === 0) {
            setImages([]);
            return;
        }

        try {

            const results = await Promise.all(
                ids.map(async (imageId) => {

                    const res = await fetch(`${API_URL}/images/${imageId}`);

                    if (!res.ok) return null;

                    return await res.json();
                })
            );

            setImages(results.filter(Boolean));

        } catch (err) {
            console.error(err);
        }
    };

    // ✔ SAVE ROOM
    const saveRoom = async () => {

        try {

            const payload = {
                roomNumber,
                type: roomType,
                pricePerNight: Number(price),
                imageIds
            };

            const url = isEditMode
                ? `${API_URL}/rooms/${id}`
                : `${API_URL}/rooms`;

            const method = isEditMode
                ? "PUT"
                : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error("Failed to save room");
            }

            const data = await res.json();

            alert(
                isEditMode
                    ? "Room updated!"
                    : "Room created!"
            );

            navigate(`/rooms/${data.id}`);

        } catch (err) {
            alert("❌ " + err.message);
        }
    };

    const updateRoomImages = async (newImageIds) => {

        const updatedRoom = {
            roomNumber,
            type: roomType,
            pricePerNight: Number(price),
            imageIds: newImageIds
        };

        const res = await fetch(`${API_URL}/rooms/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedRoom)
        });

        if (!res.ok) {
            throw new Error("Failed to update room");
        }

        const data = await res.json();

        setRoom(data);
    };

    // ✔ REMOVE IMAGE (uses backend DELETE endpoint)
    const removeImageFromRoom = async (imageId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to remove this image from the room?"
        );

        if (!confirmDelete) return;

        try {

            // backend delete
            const res = await fetch(
                `${API_URL}/rooms/${id}/images/${imageId}`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                throw new Error("Failed to delete image from room");
            }

            // local state update
            const updatedIds = imageIds.filter(i => i !== imageId);

            setImageIds(updatedIds);
            setImages(prev => prev.filter(img => img.id !== imageId));

        } catch (err) {
            alert("❌ " + err.message);
        }
    };

    const openImageSelector = () => {

        navigate("/images/select?roomId=" + id);
    };

    if (isEditMode && !room) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            <h2>
                {isEditMode
                    ? "Room details"
                    : "Create new room"}
            </h2>

            <div>
                <label>Room number</label>

                <input
                    type="number"
                    value={roomNumber}
                    onChange={(e) =>
                        setRoomNumber(Number(e.target.value))
                    }
                />
            </div>

            <div>
                <label>Type</label>

                <select
                    value={roomType}
                    onChange={(e) =>
                        setRoomType(e.target.value)
                    }
                >
                    <option value="">Select</option>
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="APARTMENT">APARTMENT</option>
                </select>
            </div>

            <div>
                <label>Price</label>

                <input
                    type="number"
                    value={price}
                    onChange={(e) =>
                        setPrice(Number(e.target.value))
                    }
                />
            </div>

            {/* SAVE BUTTON */}
            <div style={{ marginTop: "20px" }}>
                <button onClick={saveRoom}>
                    {isEditMode ? "Save" : "Create"}
                </button>
            </div>

            {/* IMAGES */}
            {isEditMode && (
                <div style={{ marginTop: "25px" }}>

                    <h3>Images</h3>

                    <button
                        onClick={openImageSelector}
                        style={{ marginBottom: "30px" }}
                    >
                        Add images from repository
                    </button>

                    {images.length > 0 && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: "12px"
                        }}>
                            {images.map(img => (
                                <div
                                    key={img.id}
                                    style={{
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.12)",
                                        position: "relative"
                                    }}
                                >

                                    <button
                                        onClick={() =>
                                            removeImageFromRoom(img.id)
                                        }
                                        style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            background: "#d32f2f",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "6px 10px",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Delete
                                    </button>

                                    <img
                                        src={img.url}
                                        alt={img.title}
                                        style={{
                                            width: "100%",
                                            height: "140px",
                                            objectFit: "cover"
                                        }}
                                    />

                                    <div style={{
                                        padding: "8px",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}>
                                        {img.title}
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )}

        </div>
    );
}