import { Routes, Route, Link } from "react-router-dom";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Users from "./pages/Users.jsx";
import UserDetails from "./pages/UserDetails.jsx";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking"
import ImageRepository from "./pages/ImageRepository"
import ImageUpload from "./pages/ImageUpload";
import ImageSelector from "./pages/ImageSelector"

function App() {
    return (
        <div style={{ padding: "20px" }}>
            <h1>🔥 Booking system</h1>
            <nav>
                <Link to="/">Home</Link> |{" "}
                <Link to="/rooms">Rooms</Link> |{" "}
                <Link to="/users">Users</Link> |{" "}
                <Link to="/bookings">Bookings</Link>

            </nav>

            {/* разделителна линия */}
            <hr style={{ marginBottom: "20px" }} />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />
                <Route path="/rooms/new" element={<RoomDetails />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetails />} />
                <Route path="/users/new" element={<UserDetails />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/new" element={<CreateBooking />} />
                <Route path="/images" element={<ImageRepository />} />
                <Route path="/images/upload" element={<ImageUpload />} />
                <Route path="/images/select" element={<ImageSelector />} />
            </Routes>
        </div>
    );
}

export default App;