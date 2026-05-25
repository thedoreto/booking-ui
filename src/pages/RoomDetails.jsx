import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import useAuth from "../auth/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

export default function RoomDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [room, setRoom] = useState(null);

    const [roomType, setRoomType] = useState("");
    const [price, setPrice] = useState(0);
    const [roomNumber, setRoomNumber] = useState(0);

    const [imageIds, setImageIds] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {

        if (!isEditMode) {
            setRoom({});
            return;
        }

        const loadRoom = async () => {
            try {
                const res = await api.get(`/rooms/${id}`);
                const data = res.data;

                setRoom(data);

                setRoomNumber(data.roomNumber ?? 0);
                setRoomType(data.type ?? "");
                setPrice(data.pricePerNight ?? 0);

                const ids = data.imageIds ?? [];
                setImageIds(ids);

                loadImages(ids);

            } catch (err) {
                alert("❌ " + (err?.response?.data || err.message));
            }
        };

        loadRoom();

    }, [id, isEditMode]);

    const loadImages = async (ids) => {

        if (!ids || ids.length === 0) {
            setImages([]);
            return;
        }

        try {
            const results = await Promise.all(
                ids.map(async (imageId) => {
                    const res = await api.get(`/images/${imageId}`);
                    return res.data;
                })
            );

            setImages(results.filter(Boolean));

        } catch (err) {
            console.error(err);
        }
    };

    const saveRoom = async () => {

        if (!isAdmin) return;

        try {

            const payload = {
                roomNumber,
                type: roomType,
                pricePerNight: Number(price),
                imageIds
            };

            const res = isEditMode
                ? await api.put(`/rooms/${id}`, payload)
                : await api.post(`/rooms`, payload);

            const data = res.data;

            alert(isEditMode ? "Room updated!" : "Room created!");

            navigate(`/rooms/${data.id}`);

        } catch (err) {
            alert("❌ " + (err?.response?.data || err.message));
        }
    };

    const openImageSelector = () => {
        if (!isAdmin) return;
        navigate("/images/select?roomId=" + id);
    };

    const removeImageFromRoom = async (imageId) => {

        if (!isAdmin) return;

        const confirmDelete = window.confirm(
            "Remove this image from the room?"
        );

        if (!confirmDelete) return;

        try {

            await api.delete(`/rooms/${id}/images/${imageId}`);

            const updatedIds = imageIds.filter(i => i !== imageId);

            setImageIds(updatedIds);
            setImages(prev => prev.filter(img => img.id !== imageId));

        } catch (err) {
            alert("❌ " + (err?.response?.data || err.message));
        }
    };

    if (isEditMode && !room) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            <h2>
                {isEditMode ? "Room details" : "Create new room"}
            </h2>

            <div>
                <label>Room number</label>
                <input
                    type="number"
                    value={roomNumber}
                    disabled={!isAdmin}
                    onChange={(e) =>
                        setRoomNumber(Number(e.target.value))
                    }
                />
            </div>

            <div>
                <label>Type</label>
                <select
                    value={roomType}
                    disabled={!isAdmin}
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
                    disabled={!isAdmin}
                    onChange={(e) =>
                        setPrice(Number(e.target.value))
                    }
                />
            </div>

            {isAdmin && (
                <div style={{ marginTop: "20px" }}>
                    <button onClick={saveRoom}>
                        {isEditMode ? "Save" : "Create"}
                    </button>
                </div>
            )}

            {isEditMode && (
                <div style={{ marginTop: "25px" }}>

                    <h3>Images</h3>

                    {isAdmin && (
                        <button
                            onClick={openImageSelector}
                            style={{ marginBottom: "30px" }}
                        >
                            Add images from repository
                        </button>
                    )}

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
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                                        position: "relative"
                                    }}
                                >

                                    {isAdmin && (
                                        <button
                                            onClick={() => removeImageFromRoom(img.id)}
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
                                    )}

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