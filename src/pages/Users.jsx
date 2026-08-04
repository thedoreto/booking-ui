import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../auth/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

export default function Users() {

    const { user, loading } = useAuth();
    const [users, setUsers] = useState([]);

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {

        if (!isAdmin) return;

        const load = async () => {
            try {
                const res = await api.get("/users");
                setUsers(res.data);
            } catch (err) {
                console.error(err);
                alert("Failed to load users");
            }
        };

        load();

    }, [isAdmin]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

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
                        {c.name} ({c.email}) - {c.role}
                    </Link>
                ))}
            </div>


        </div>
    );
}