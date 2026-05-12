import { Routes, Route, Link } from "react-router-dom";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking"

function App() {
    return (
        <div style={{ padding: "20px" }}>
            <h1>🔥 Booking system</h1>
            <nav>
                <Link to="/">Home</Link> |{" "}
                <Link to="/rooms">Rooms</Link> |{" "}
                <Link to="/customers">Customers</Link> |{" "}
                <Link to="/bookings">Bookings</Link>

            </nav>

            {/* разделителна линия */}
            <hr style={{ marginBottom: "20px" }} />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />
                <Route path="/rooms/new" element={<RoomDetails />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerDetails />} />
                <Route path="/customers/new" element={<CustomerDetails />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/new" element={<CreateBooking />} />
            </Routes>
        </div>
    );
}

export default App;