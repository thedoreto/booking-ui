import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function Rooms() {

    const [rooms, setRooms] = useState([]);
    const { user } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {

        const loadRooms = async () => {
            try {
                const response = await api.get("/rooms");
                setRooms(response.data);
            } catch (err) {
                console.error("Failed to load rooms:", err);
            }
        };

        loadRooms();

    }, []);

    const isAdmin = user?.role === "ADMIN";

    return (
        <div>
            <h2>Rooms</h2>

            {rooms.map(r => (
                <div key={r.id}>
                    <Link to={`/rooms/${r.id}`}>
                        {r.roomNumber} - {r.type} - {r.pricePerNight}
                    </Link>
                </div>
            ))}

            {isAdmin && (
                <>
                    <hr style={{ marginTop: "20px", marginBottom: "10px" }} />

                    <button onClick={() => navigate("/rooms/new")}>
                        Add new room
                    </button>

                    <button
                        onClick={() => navigate("/images")}
                        style={{ marginLeft: "10px" }}
                    >
                        Image repository
                    </button>
                </>
            )}
        </div>
    );
}