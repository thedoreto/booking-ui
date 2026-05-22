import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/users`)
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    return (
        <div>
            <h2>Users</h2>

            <div>
                {users.map(c => (
                    <Link
                        key={c.id}
                        to={`/users/${c.id}`}
                        style={{
                            display: "block",
                            padding: "3px 0",
                            color: "#1976d2",
                            textDecoration: "underline"
                        }}
                    >
                        {c.name} ({c.email})
                    </Link>
                ))}
            </div>

            <hr style={{ margin: "12px 0" }} />

            <Link to="/users/new">
                <button>Add new user</button>
            </Link>
        </div>
    );
}