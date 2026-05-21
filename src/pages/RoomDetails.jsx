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

        if (!isEditMode) return;

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

    // ✔ FIXED NAVIGATION (no callback in state)
    const openImageSelector = () => {

        navigate("/images/select?roomId=" + id);
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            <h2>Room details</h2>

            <div>
                <label>Room number</label>
                <input
                    type="number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(Number(e.target.value))}
                />
            </div>

            <div>
                <label>Type</label>
                <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
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
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
            </div>

            <button onClick={openImageSelector}>
                Add images from repository
            </button>

            {images.length > 0 && (
                <div style={{ marginTop: "25px" }}>
                    <h3>Images</h3>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "12px"
                    }}>
                        {images.map(img => (
                            <div
                                key={img.id}
                                style={{
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
                                }}
                            >
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
                </div>
            )}

        </div>
    );
}