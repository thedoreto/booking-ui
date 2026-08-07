import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function NavBar() {

    const { user, token, loading } = useAuth();

    if (loading) return null;

    const isAdmin = user?.role === "ADMIN";

    const linkStyle = {
        color: "#1c4498",
        textDecoration: "none",
        fontWeight: "500"
    };

    const separatorStyle = {
        color: "#d1d5db"
    };

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
                    <Link to="/login" style={linkStyle}>
                        Login
                    </Link>

                    <span style={separatorStyle}>|</span>

                    <Link to="/register" style={linkStyle}>
                        Register
                    </Link>
                </>
            ) : (
                <>

                    <Link to="/hotelinfo" style={linkStyle}>
                        Hotel Info
                    </Link>

                    <span style={separatorStyle}>|</span>

                    <Link to="/dashboard" style={linkStyle}>
                        Dashboard
                    </Link>

                    <span style={separatorStyle}>|</span>

                    <Link to="/rooms" style={linkStyle}>
                        Rooms
                    </Link>

                    <span style={separatorStyle}>|</span>

                    <Link to="/bookings" style={linkStyle}>
                        Bookings
                    </Link>

                    {isAdmin && (
                        <>
                            <span style={separatorStyle}>|</span>

                            <Link to="/users" style={linkStyle}>
                                Users
                            </Link>

                            <span style={separatorStyle}>|</span>

                            <Link to="/images" style={linkStyle}>
                                Image Repository
                            </Link>

                        </>
                    )}


                </>
            )}

        </nav>
    );
}