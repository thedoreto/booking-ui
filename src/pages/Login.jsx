import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            const token = response?.data?.token;

            if (!token) {
                throw new Error("No token returned from backend");
            }

            localStorage.setItem("token", token);

            // optional: small delay to ensure interceptor sync
            setTimeout(() => {
                navigate("/dashboard");
            }, 100);

        } catch (err) {
            console.error("Login error:", err);
            alert("Invalid credentials or server error");
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
                onSubmit={handleLogin}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    width: "300px"
                }}
            >

                <h2>Login</h2>

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
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>
        </div>
    );
}