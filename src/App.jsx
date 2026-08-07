import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import useAuth from "./auth/useAuth";

import ChatWindow from "./components/ChatWindow";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking";
import ImageRepository from "./pages/ImageRepository";
import ImageUpload from "./pages/ImageUpload";
import ImageSelector from "./pages/ImageSelector";
import HotelInfo from "./pages/HotelInfo";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import NavBar from "./components/NavBar";

function App() {

    const { user, token, logout, loading } = useAuth();

    const hotelName = "ХОТЕЛ СЕДМАТА ЗВЕЗДА";
    const hotelStars = "✦ ✦ ✦ ✦ ✦ ✦ ✦";

    if (loading) return null;

    return (
        <div style={{ padding: "20px" }}>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >

                <div
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: "#1c4498",
                        fontSize: "24px",
                        letterSpacing: "4px"
                    }}
                >
                    {hotelStars}
                    <br />
                    {hotelName}
                </div>

                {user && (
                    <button
                        onClick={logout}
                        style={{
                            padding: "6px 12px",
                            cursor: "pointer",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            background: "white",
                            color: "#1c4498",
                            fontWeight: "500"
                        }}
                    >
                        Logout
                    </button>
                )}

            </div>

            <hr
                style={{
                    border: "none",
                    borderTop: "1px solid #e5e7eb",
                    margin: "15px 0"
                }}
            />

            <NavBar />

            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/hotelinfo" element={<ProtectedRoute><HotelInfo /></ProtectedRoute>} />
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

                <Route path="*" element={<Navigate to={token ? "/hotelinfo" : "/login"} />} />

            </Routes>

            {user && <ChatWindow user={user} />}

        </div>
    );
}

export default App;