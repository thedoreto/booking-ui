import { useEffect, useState } from "react";
function App() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        fetch("https://booking-system-1-jfv3.onrender.com/allRooms")
            .then((res) => res.json())
            .then((data) => setRooms(data));
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>🔥 THIS IS REACT UI (App.jsx is running)</h1>

            <p style={{ color: "red" }}>
                DEBUG: ако виждаш това → тази страница се зарежда правилно
            </p>

            <hr />

            <h2>Rooms</h2>

            {rooms.map((room) => (
                <div key={room.id}>
                    {room.roomNumber} - {room.type} - {room.pricePerNight}
                </div>
            ))}
        </div>
    );
}
export default App;