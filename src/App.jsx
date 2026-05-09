import { useEffect, useState } from "react";

function App() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        fetch("https://booking-system-1-jfv3.onrender.com/allRooms")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch((err) => console.error("Error:", err));
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>Rooms</h1>

            {rooms.map((room) => (
                <div
                    key={room.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "8px"
                    }}
                >
                    <p>Room number: {room.roomNumber}</p>
                    <p>Type: {room.type}</p>
                    <p>Price: {room.pricePerNight} €</p>
                </div>
            ))}
        </div>
    );
}

export default App;