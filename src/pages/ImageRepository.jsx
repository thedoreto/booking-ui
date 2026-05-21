import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function ImageRepository() {

    const [images, setImages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = () => {

        fetch(`${API_URL}/images`)
            .then(async (res) => {

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to load images");
                }

                return data;
            })
            .then((data) => setImages(data))
            .catch((err) => {
                console.error(err);
                alert("❌ " + err.message);
            });
    };

    const deleteImage = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this image?"
        );

        if (!confirmDelete) return;

        try {

            const res = await fetch(`${API_URL}/images/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Failed to delete image");
            }

            loadImages();

        } catch (err) {
            console.error(err);
            alert("❌ " + err.message);
        }
    };

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
                <h2 style={{ margin: 0 }}>Image Repository</h2>

                <button
                    onClick={() => navigate("/images/upload")}
                    style={{
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#1976d2",
                        color: "white",
                        fontWeight: "600",
                        cursor: "pointer"
                    }}
                >
                    Add Image
                </button>
            </div>

            {/* EMPTY STATE */}
            {images.length === 0 && (
                <div style={{ color: "#666" }}>
                    No images uploaded yet.
                </div>
            )}

            {/* GRID */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "16px"
                }}
            >
                {images.map((img) => (
                    <div
                        key={img.id}
                        style={{
                            borderRadius: "14px",
                            overflow: "hidden",
                            background: "#fff",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                            transition: "transform 0.2s",
                            position: "relative"
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "translateY(-3px)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "translateY(0)")
                        }
                    >

                        {/* DELETE BUTTON */}
                        <button
                            onClick={() => deleteImage(img.id)}
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "rgba(211,47,47,0.9)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 8px",
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
                            loading="lazy"
                            style={{
                                width: "100%",
                                height: "220px",
                                objectFit: "cover",
                                display: "block"
                            }}
                        />

                        <div style={{ padding: "10px" }}>
                            <div style={{ fontWeight: "600" }}>
                                {img.title}
                            </div>

                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#777",
                                    wordBreak: "break-all",
                                    marginTop: "4px"
                                }}
                            >
                                {img.id}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}