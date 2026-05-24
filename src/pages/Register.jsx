import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            await api.post("/auth/register", {
                name,
                email,
                password
            });

            alert("Registration successful");

            navigate("/login");

        } catch (err) {

            console.error("Register error:", err);

            if (err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
                alert("Register failed");
            }

        } finally {

            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "100px"
            }}
        >
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
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div
                    style={{
                        display: "flex",
                        gap: "5px"
                    }}
                >

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ flex: 1 }}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }
                    >
                        {showPassword ? "🙈" : "👁"}
                    </button>

                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating account..."
                        : "Register"}
                </button>

            </form>
        </div>
    );
}