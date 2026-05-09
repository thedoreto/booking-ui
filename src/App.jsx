function App() {
    const [rooms] = useState([
        { id: 1, name: "Room A" },
        { id: 2, name: "Room B" },
        { id: 3, name: "Room C" }
    ]);

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