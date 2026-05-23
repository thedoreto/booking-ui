import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Dashboard() {

    const navigate = useNavigate();

    const [userId, setUserId] = useState("");

    useEffect(() => {

        fetchMe();

    }, []);

    const fetchMe = async () => {

        try {

            const response = await api.get("/me");

            setUserId(response.data);

        } catch (err) {

            console.error(err);

            logout();
        }
    };

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/login");
    };

    return (
        <div style={{ padding: "30px" }}>

            <h1>Dashboard</h1>

            <p>
                Current user id: {userId}
            </p>

            <button onClick={logout}>
                Logout
            </button>

        </div>
    );
}