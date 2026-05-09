import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
      fetch(`${import.meta.env.VITE_API_URL}/allRooms`)
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