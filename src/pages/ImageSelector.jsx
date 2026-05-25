import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function ImageSelector() {

    const [images, setImages] = useState([]);
    const [selected, setSelected] = useState([]);
    const [room, setRoom] = useState(null);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const roomId = searchParams.get("roomId");

    const { user, loading } = useAuth();

    const isAdmin = user?.role === "ADMIN";

    // 🔥 block direct URL access for non-admin
    useEffect(() => {

        if (!loading && !isAdmin) {
            navigate("/");
        }

    }, [loading, isAdmin, navigate]);

    useEffect(() => {

        if (!isAdmin) return;

        loadImages();
        loadRoom();

    }, [isAdmin]);

    const loadImages = async () => {

        try {

            const res = await api.get("/images");

            setImages(res.data);

        } catch (err) {

            console.error(err);

            alert(
                "❌ " +
                (err?.response?.data?.message || err.message)
            );
        }
    };

    const loadRoom = async () => {

        if (!roomId) return;

        try {

            const res = await api.get(`/rooms/${roomId}`);

            setRoom(res.data);

        } catch (err) {

            console.error(err);

            alert(
                "❌ " +
                (err?.response?.data?.message || err.message)
            );
        }
    };

    const toggleSelect = (id) => {

        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const cancel = () => {
        navigate(-1);
    };

    const confirmSelection = async () => {

        try {

            if (!roomId) {
                throw new Error("Missing roomId");
            }

            if (selected.length === 0) {
                navigate(-1);
                return;
            }

            await api.post(
                `/rooms/${roomId}/images/add`,
                selected
            );

            navigate(-1);

        } catch (err) {

            console.error(err);

            alert(
                "❌ " +
                (err?.response?.data?.message || err.message)
            );
        }
    };

    // 🔥 avoid flicker while auth loads
    if (loading) {
        return <div>Loading...</div>;
    }

    // 🔥 extra safety
    if (!isAdmin) {
        return null;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>

            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                }}
            >
                <h2>Image Selector</h2>

                <div>
                    <button onClick={cancel} style={{ marginRight: "10px" }}>
                        Cancel
                    </button>

                    <button
                        onClick={confirmSelection}
                        disabled={selected.length === 0}
                        style={{
                            background: "green",
                            color: "white",
                            padding: "8px 14px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                    >
                        Confirm ({selected.length})
                    </button>
                </div>
            </div>

            {/* GRID */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "14px"
                }}
            >
                {images.map(img => {

                    const isSelected = selected.includes(img.id);

                    return (
                        <div
                            key={img.id}
                            onClick={() => toggleSelect(img.id)}
                            style={{
                                cursor: "pointer",
                                borderRadius: "12px",
                                overflow: "hidden",
                                border: isSelected
                                    ? "3px solid #1976d2"
                                    : "3px solid transparent",
                                boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                                position: "relative"
                            }}
                        >

                            <img
                                src={img.url}
                                alt={img.title}
                                style={{
                                    width: "100%",
                                    height: "160px",
                                    objectFit: "cover",
                                    display: "block"
                                }}
                            />

                            <div style={{ padding: "8px" }}>
                                <div style={{ fontWeight: "600", fontSize: "14px" }}>
                                    {img.title}
                                </div>
                            </div>

                            {isSelected && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "8px",
                                        right: "8px",
                                        background: "#1976d2",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: "24px",
                                        height: "24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "14px"
                                    }}
                                >
                                    ✓
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

        </div>
    );
}