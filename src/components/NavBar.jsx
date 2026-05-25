import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function NavBar() {

    const { user, token, logout, loading } = useAuth();

    if (loading) return null;

    const isAdmin = user?.role === "ADMIN";

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "18px",
                padding: "12px 20px",
                borderBottom: "1px solid #ddd"
            }}
        >
            {!token ? (
                <>
                    <Link to="/login">Login</Link>
                    <span>|</span>
                    <Link to="/register">Register</Link>
                </>
            ) : (
                <>
                    <Link to="/">Home</Link>
                    <span>|</span>

                    <Link to="/dashboard">Dashboard</Link>
                    <span>|</span>

                    <Link to="/rooms">Rooms</Link>
                    <span>|</span>

                    <Link to="/bookings">Bookings</Link>

                    {isAdmin && (
                        <>
                            <span>|</span>
                            <Link to="/users">Users</Link>
                            <span>|</span>
                            <Link to="/images">Image Repository</Link>
                        </>
                    )}

                    {/* spacer pushes logout right */}
                    <div style={{ marginLeft: "30px" }} />

                    <button
                        onClick={logout}
                        style={{
                            padding: "6px 12px",
                            cursor: "pointer",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            background: "white"
                        }}
                    >
                        Logout
                    </button>
                </>
            )}
        </nav>
    );
}