import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import useAuth from "./auth/useAuth";

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

import NavBar from "./components/NavBar";

function App() {

    const { user, token, loading } = useAuth();

    if (loading) return null;

    return (
        <div style={{ padding: "20px" }}>

            <h1>🔥 Booking system</h1>

            {/* 🔥 ONLY ONE NAVIGATION SOURCE */}
            <NavBar />

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