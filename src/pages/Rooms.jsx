import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/rooms`)
            .then(res => res.json())
            .then(data => setRooms(data));
    }, []);

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

            {/* divider */}
            <hr style={{ marginTop: "20px", marginBottom: "10px" }} />

            {/* Add new room button */}
            <button
                onClick={() => navigate("/rooms/new")}
            >
                Add new room
            </button>
        </div>
    );
}