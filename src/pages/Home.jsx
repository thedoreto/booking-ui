import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div style={{ padding: "20px" }}>
            <h1>Booking system</h1>

            <ul>
                <li><Link to="/rooms">Rooms</Link></li>
                <li><Link to="/customers">Customers</Link></li>
                <li><Link to="/bookings">Bookings</Link></li>
            </ul>
        </div>
    );
}