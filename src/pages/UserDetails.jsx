import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const isCreateMode = !id || id === "new";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const getErrorMessage = (data, fallback) => {

        if (!data) return fallback;

        return (
            data.detail ||
            data.message ||
            data.error ||
            fallback
        );
    };

    useEffect(() => {

        if (isCreateMode) return;

        fetch(`${API_URL}/users/${id}`)
            .then(async (res) => {

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Failed to load user")
                    );
                }

                return data;
            })
            .then(data => {

                setName(data.name ?? "");
                setEmail(data.email ?? "");
                setPassword(data.password ?? "");

            })
            .catch(err => alert(err.message));

    }, [id]);

    const save = () => {

        const url = isCreateMode
            ? `${API_URL}/users`
            : `${API_URL}/users/${id}`;

        const method = isCreateMode ? "POST" : "PUT";

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        })
            .then(async (res) => {

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Save failed")
                    );
                }

                return data;
            })
            .then(() => {

                alert(
                    isCreateMode
                        ? "User created!"
                        : "User updated!"
                );

                navigate("/users");

            })
            .catch(err => alert(err.message));
    };

    const deleteUser = () => {

        if (!window.confirm("Delete this user?")) return;

        fetch(`${API_URL}/users/${id}`, {
            method: "DELETE"
        })
            .then(async (res) => {

                let data = null;

                try {
                    data = await res.json();
                } catch {
                    // ignore empty body
                }

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Delete failed")
                    );
                }

                alert("User deleted!");

                navigate("/users");

            })
            .catch(err => alert(err.message));
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "40px"
            }}
        >

            <h2>
                {isCreateMode
                    ? "Create user"
                    : "User details"}
            </h2>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "420px"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "10px"
                    }}
                >
                    <label style={{ width: "90px" }}>
                        Name:
                    </label>

                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "10px"
                    }}
                >
                    <label style={{ width: "90px" }}>
                        Email:
                    </label>

                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "10px"
                    }}
                >
                    <label style={{ width: "90px" }}>
                        Password:
                    </label>

                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            flex: 1
                        }}
                    >
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ flex: 1 }}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(prev => !prev)
                            }
                        >
                            {showPassword ? "🙈" : "👁"}
                        </button>
                    </div>
                </div>

            </div>

            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px"
                }}
            >

                <button onClick={save}>
                    {isCreateMode ? "Create" : "Save"}
                </button>

                {!isCreateMode && (
                    <button
                        onClick={deleteUser}
                        style={{ color: "red" }}
                    >
                        Delete
                    </button>
                )}

            </div>

        </div>
    );
}