import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import useAuth from "../auth/useAuth";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUpload() {

    const [file, setFile] = useState(null);
    const [filePath, setFilePath] = useState("");
    const [title, setTitle] = useState("");
    const [loadingUpload, setLoadingUpload] = useState(false);

    const fileRef = useRef(null);

    const navigate = useNavigate();

    const { user, loading } = useAuth();

    const isAdmin = user?.role === "ADMIN";

    // 🔥 block direct URL access for non-admin
    useEffect(() => {

        if (!loading && !isAdmin) {
            navigate("/");
        }

    }, [loading, isAdmin, navigate]);

    const selectFile = () => {
        fileRef.current?.click();
    };

    const handleFile = (e) => {

        const f = e.target.files?.[0];

        if (!f) return;

        setFile(f);
        setFilePath(f.name);
    };

    const upload = async () => {

        if (!file) return;

        try {

            setLoadingUpload(true);

            // 1. upload to Cloudinary
            const formData = new FormData();

            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const cloudRes = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const cloudData = await cloudRes.json();

            if (!cloudRes.ok) {
                throw new Error("Cloudinary upload failed");
            }

            // 2. save in backend
            await api.post("/images/upload", {
                url: cloudData.secure_url,
                title: title || file.name
            });

            // 3. return
            navigate("/images", { replace: true });

        } catch (err) {

            console.error(err);

            alert(
                "❌ " +
                (err?.response?.data?.message || err.message)
            );

        } finally {

            setLoadingUpload(false);
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
        <div style={{ padding: "20px", maxWidth: "600px" }}>

            <h2>Upload Image</h2>

            {/* URL FIELD (read-only visual) */}
            <div style={{ marginBottom: "16px" }}>

                <label>Image file</label>

                <div style={{ display: "flex", gap: "10px" }}>

                    <input
                        value={filePath}
                        placeholder="No file selected"
                        readOnly
                        style={{ flex: 1, padding: "10px" }}
                    />

                    <button onClick={selectFile}>
                        Select Image
                    </button>

                </div>

                <input
                    type="file"
                    ref={fileRef}
                    onChange={handleFile}
                    style={{ display: "none" }}
                    accept="image/*"
                />

            </div>

            {/* TITLE */}
            <div style={{ marginBottom: "16px" }}>

                <label>Title</label>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px" }}
                />

            </div>

            {/* UPLOAD BUTTON */}
            <button
                onClick={upload}
                disabled={loadingUpload}
                style={{
                    padding: "12px 20px",
                    background: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "8px"
                }}
            >
                {loadingUpload ? "Uploading..." : "Upload"}
            </button>

        </div>
    );
}