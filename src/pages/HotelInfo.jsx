import { useEffect, useState } from "react";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function HotelInfo() {

    const { loading, user } = useAuth();

    const [info, setInfo] = useState([]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const isAdmin = user?.role === "ADMIN";

    const getErrorMessage = (data, fallback) => {
        if (!data) return fallback;

        return (
            data.message ||
            data.detail ||
            data.error ||
            fallback
        );
    };

    const loadHotelInfo = async () => {

        try {

            const res = await api.get("/hotelinfo");

            setInfo(res.data);

        } catch (err) {

            const data = err?.response?.data;

            alert(
                "❌ " +
                getErrorMessage(data, "Failed to load hotel info")
            );
        }
    };

    useEffect(() => {
        loadHotelInfo();
    }, []);

    const editInfo = (id) => {
        alert("Edit hotel info: " + id);
    };

    return (
        <div>

            <h2>Hotel Information</h2>

            {info.map(item => (

                <div
                    key={item.id}
                    style={{
                        borderBottom: "1px solid #ccc",
                        padding: "10px 0"
                    }}
                >

                    <h3>{item.title}</h3>

                    <p>{item.text}</p>

                    <div>
                        Category: {item.category}
                    </div>

                    {item.tags && (
                        <div>
                            Tags: {item.tags.join(", ")}
                        </div>
                    )}

                    {isAdmin && (
                        <button
                            style={{
                                marginTop: "10px",
                                cursor: "pointer"
                            }}
                            onClick={() => editInfo(item.id)}
                        >
                            Edit
                        </button>
                    )}

                </div>

            ))}

        </div>
    );
}