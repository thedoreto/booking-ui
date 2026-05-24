import {
    Routes,
    Route,
    Link,
    Navigate
} from "react-router-dom";

import { useEffect, useState } from "react";
import api from "./api/api";

import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking";
import ImageRepository from "./pages/ImageRepository";
import ImageUpload from "./pages/ImageUpload";
import ImageSelector from "./pages/ImageSelector";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [role, setRole] = useState(null);

    // 🔥 единствен source of truth за role
    const fetchMe = async () => {
        try {
            const res = await api.get("/me");
            setRole(res.data?.role || null);
        } catch (err) {
            setRole(null);
        }
    };

    useEffect(() => {

        const syncAuth = () => {
            const t = localStorage.getItem("token");

            setToken(t);

            if (t) {
                fetchMe();
            } else {
                setRole(null);
            }
        };

        window.addEventListener("storage", syncAuth);

        syncAuth();

        return () => {
            window.removeEventListener("storage", syncAuth);
        };

    }, []);

    const isAdmin = role === "ADMIN";

    return (
        <div style={{ padding: "20px" }}>

            <h1>🔥 Booking system</h1>

            {!token ? (
                <nav>
                    <Link to="/login">Login</Link> |{" "}
                    <Link to="/register">Register</Link>
                </nav>
            ) : (
                <nav>
                    <Link to="/">Home</Link> |{" "}
                    <Link to="/dashboard">Dashboard</Link> |{" "}
                    <Link to="/rooms">Rooms</Link> |{" "}
                    <Link to="/bookings">Bookings</Link>

                    {isAdmin && (
                        <>
                            |{" "}
                            <Link to="/users">Users</Link> |{" "}
                            <Link to="/images">Images</Link>
                        </>
                    )}
                </nav>
            )}

            <hr style={{ marginBottom: "20px" }} />

            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
                <Route path="/rooms/:id" element={<ProtectedRoute><RoomDetails /></ProtectedRoute>} />
                <Route path="/rooms/new" element={<ProtectedRoute><RoomDetails /></ProtectedRoute>} />

                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
                <Route path="/users/new" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />

                <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                <Route path="/bookings/new" element={<ProtectedRoute><CreateBooking /></ProtectedRoute>} />

                <Route path="/images" element={<ProtectedRoute><ImageRepository /></ProtectedRoute>} />
                <Route path="/images/upload" element={<ProtectedRoute><ImageUpload /></ProtectedRoute>} />
                <Route path="/images/select" element={<ProtectedRoute><ImageSelector /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />

            </Routes>

        </div>
    );
}

export default App;