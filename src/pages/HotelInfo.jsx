import { useEffect, useState } from "react";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function HotelInfo() {

    const { loading, user } = useAuth();

    const [info, setInfo] = useState([]);
    const [imageMap, setImageMap] = useState({});

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

            console.log("HOTEL INFO RESPONSE:", res.data);

            setInfo(res.data);

            const allImageIds = res.data.flatMap(
                item => item.imageIds || []
            );

            const uniqueImageIds = [...new Set(allImageIds)];

            const imageResults = await Promise.all(
                uniqueImageIds.map(async (imageId) => {

                    try {

                        const imageResponse =
                            await api.get(`/images/${imageId}`);

                        return [
                            imageId,
                            imageResponse.data
                        ];

                    } catch (err) {

                        console.error(
                            "Failed to load image:",
                            imageId,
                            err
                        );

                        return [imageId, null];
                    }
                })
            );

            setImageMap(
                Object.fromEntries(imageResults)
            );

        } catch (err) {

            const data = err?.response?.data;

            alert(
                "❌ " +
                getErrorMessage(
                    data,
                    "Failed to load hotel info"
                )
            );
        }
    };

    useEffect(() => {
        loadHotelInfo();
    }, []);

    const editInfo = (id) => {
        alert("Edit hotel info: " + id);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>



            {info.map((item, index) => (

                <div
                    key={item.id || index}
                    style={{
                        borderBottom: "1px solid #e5e7eb",
                        padding: "10px 0"
                    }}
                >

                    {/* HOTEL INFORMATION */}

                    {item.name && (
                        <h3 style={{ color: "#1c4498" }}>
                            {item.name}
                        </h3>
                    )}

                    {item.description && (
                        <p>
                            {item.description}
                        </p>
                    )}

                    {item.address && (
                        <div>
                            <strong style={{ color: "#1c4498" }}>
                                Address:
                            </strong>{" "}
                            {item.address}
                        </div>
                    )}

                    {item.phone && (
                        <div>
                            <strong style={{ color: "#1c4498" }}>
                                Phone:
                            </strong>{" "}
                            {item.phone}
                        </div>
                    )}

                    {item.email && (
                        <div>
                            <strong style={{ color: "#1c4498" }}>
                                Email:
                            </strong>{" "}
                            {item.email}
                        </div>
                    )}

                    {/* IMAGES */}

                    {item.imageIds?.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginTop: "15px"
                            }}
                        >

                            {item.imageIds.map(imageId => {

                                const image =
                                    imageMap[imageId];

                                if (!image) {
                                    return null;
                                }

                                return (
                                    <img
                                        key={imageId}
                                        src={image.url}
                                        alt={
                                            image.title ||
                                            item.name ||
                                            "Hotel"
                                        }
                                        style={{
                                            width: "200px",
                                            height: "130px",
                                            objectFit: "cover",
                                            borderRadius: "6px",
                                            border:
                                                "1px solid #e5e7eb"
                                        }}
                                    />
                                );
                            })}

                        </div>
                    )}

                    {/* KNOWLEDGE */}

                    {item.knowledge?.length > 0 && (
                        <div
                            style={{
                                marginTop: "20px"
                            }}
                        >

                            {item.knowledge.map(
                                (
                                    knowledge,
                                    knowledgeIndex
                                ) => (

                                    <div
                                        key={
                                            knowledge.id ||
                                            knowledgeIndex
                                        }
                                        style={{
                                            padding: "10px 0",
                                            borderTop:
                                                "1px solid #e5e7eb"
                                        }}
                                    >

                                        {knowledge.title && (
                                            <h3
                                                style={{
                                                    color:
                                                        "#1c4498"
                                                }}
                                            >
                                                {knowledge.title}
                                            </h3>
                                        )}

                                        {knowledge.text && (
                                            <p>
                                                {knowledge.text}
                                            </p>
                                        )}

                                        {knowledge.category && (
                                            <div>
                                                <strong
                                                    style={{
                                                        color:
                                                            "#1c4498"
                                                    }}
                                                >
                                                    Category:
                                                </strong>{" "}
                                                {
                                                    knowledge.category
                                                }
                                            </div>
                                        )}

                                        {knowledge.tags?.length > 0 && (
                                            <div>
                                                <strong
                                                    style={{
                                                        color:
                                                            "#1c4498"
                                                    }}
                                                >
                                                    Tags:
                                                </strong>{" "}
                                                {knowledge.tags.join(
                                                    ", "
                                                )}
                                            </div>
                                        )}

                                        {knowledge.source && (
                                            <div>
                                                <strong
                                                    style={{
                                                        color:
                                                            "#1c4498"
                                                    }}
                                                >
                                                    Source:
                                                </strong>{" "}
                                                {
                                                    knowledge.source
                                                }
                                            </div>
                                        )}

                                        {isAdmin && (
                                            <button
                                                style={{
                                                    marginTop:
                                                        "10px",
                                                    cursor:
                                                        "pointer",
                                                    padding:
                                                        "6px 12px",
                                                    border:
                                                        "1px solid #1c4498",
                                                    borderRadius:
                                                        "6px",
                                                    background:
                                                        "white",
                                                    color:
                                                        "#1c4498",
                                                    fontWeight:
                                                        "500"
                                                }}
                                                onClick={() =>
                                                    editInfo(
                                                        knowledge.id
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>
            ))}

        </div>
    );
}

