import {
    Routes,
    Route,
    Link,
    Navigate
} from "react-router-dom";

import { useEffect, useState } from "react";

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

    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {

        const syncToken = () => {
            setToken(localStorage.getItem("token"));
        };

        window.addEventListener("storage", syncToken);

        return () => {
            window.removeEventListener("storage", syncToken);
        };

    }, []);

    return (
        <div style={{ padding: "20px" }}>

            <h1>🔥 Booking system</h1>

            {!token && (
                <nav>
                    <Link to="/login">Login</Link> |{" "}
                    <Link to="/register">Register</Link>
                </nav>
            )}

            {token && (
                <nav>
                    <Link to="/">Home</Link> |{" "}
                    <Link to="/dashboard">Dashboard</Link> |{" "}
                    <Link to="/rooms">Rooms</Link> |{" "}
                    <Link to="/users">Users</Link> |{" "}
                    <Link to="/bookings">Bookings</Link> |{" "}
                    <Link to="/images">Images</Link>
                </nav>
            )}

            <hr style={{ marginBottom: "20px" }} />

            <Routes>

                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* PROTECTED */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/rooms" element={
                    <ProtectedRoute>
                        <Rooms />
                    </ProtectedRoute>
                } />

                <Route path="/rooms/:id" element={
                    <ProtectedRoute>
                        <RoomDetails />
                    </ProtectedRoute>
                } />

                <Route path="/rooms/new" element={
                    <ProtectedRoute>
                        <RoomDetails />
                    </ProtectedRoute>
                } />

                <Route path="/users" element={
                    <ProtectedRoute>
                        <Users />
                    </ProtectedRoute>
                } />

                <Route path="/users/:id" element={
                    <ProtectedRoute>
                        <UserDetails />
                    </ProtectedRoute>
                } />

                <Route path="/users/new" element={
                    <ProtectedRoute>
                        <UserDetails />
                    </ProtectedRoute>
                } />

                <Route path="/bookings" element={
                    <ProtectedRoute>
                        <Bookings />
                    </ProtectedRoute>
                } />

                <Route path="/bookings/new" element={
                    <ProtectedRoute>
                        <CreateBooking />
                    </ProtectedRoute>
                } />

                <Route path="/images" element={
                    <ProtectedRoute>
                        <ImageRepository />
                    </ProtectedRoute>
                } />

                <Route path="/images/upload" element={
                    <ProtectedRoute>
                        <ImageUpload />
                    </ProtectedRoute>
                } />

                <Route path="/images/select" element={
                    <ProtectedRoute>
                        <ImageSelector />
                    </ProtectedRoute>
                } />

                {/* FALLBACK */}
                <Route
                    path="*"
                    element={<Navigate to={token ? "/" : "/login"} />}
                />

            </Routes>

        </div>
    );
}

export default App;