import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            await api.post("/auth/register", {
                email,
                password
            });

            alert("Registration successful");

            navigate("/login");

        } catch (err) {
            console.error("Register error:", err);
            alert("Register failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "100px"
        }}>
            <form
                onSubmit={handleRegister}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    width: "300px"
                }}
            >

                <h2>Register</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>

            </form>
        </div>
    );
}