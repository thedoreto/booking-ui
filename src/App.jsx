import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("https://booking-system-1-jfv3.onrender.com/rooms")
        .then((res) => res.json())
        .then((data) => setRooms(data));
  }, []);

  return (
      <div>
        <h1>Rooms</h1>

        {rooms.map((r) => (
            <div key={r.id}>
              {r.name}
            </div>
        ))}
      </div>
  );
}

export default App;