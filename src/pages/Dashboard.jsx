import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchMe();
    }, []);

    const fetchMe = async () => {
        try {
            const response = await api.get("/me");
            setUser(response.data);
        } catch (err) {
            console.error(err);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    return (
        <div style={{ padding: "30px" }}>

            <h1>Dashboard</h1>

            {user ? (
                <>
                    <p>Name: {user.name || "-"}</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <p>User ID: {user.id}</p>
                </>
            ) : (
                <p>Loading user...</p>
            )}

            <button onClick={logout}>
                Logout
            </button>

        </div>
    );
}