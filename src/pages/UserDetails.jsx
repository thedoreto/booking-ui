import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import api from "../api/api";

export default function UserDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const { user, loading } = useAuth();

    const isAdmin = user?.role === "ADMIN";
    const isCreateMode = !id || id === "new";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("USER");

    const [error, setError] = useState(null);

    const getErrorMessage = (data, fallback) => {
        if (!data) return fallback;

        return (
            data.detail ||
            data.message ||
            data.error ||
            fallback
        );
    };

    // guard
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {

        if (isCreateMode) return;

        const load = async () => {
            try {
                setError(null);

                const res = await api.get(`/users/${id}`);
                const data = res.data;

                setName(data.name ?? "");
                setEmail(data.email ?? "");
                setRole(data.role ?? "USER");

            } catch (err) {

                const data = err?.response?.data;

                setError(
                    getErrorMessage(data, "Failed to load user")
                );
            }
        };

        load();

    }, [id]);

    const save = async () => {

        try {

            const payload = {
                name,
                email,
                role
            };

            const url = isCreateMode
                ? "/users"
                : `/users/${id}`;

            const method = isCreateMode ? "post" : "put";

            await api[method](url, payload);

            alert(isCreateMode ? "User created!" : "User updated!");
            navigate("/users");

        } catch (err) {

            const data = err?.response?.data;

            alert(
                getErrorMessage(data, "Save failed")
            );
        }
    };

    const deleteUser = async () => {

        if (!window.confirm("Delete this user?")) return;

        try {

            await api.delete(`/users/${id}`);

            alert("User deleted!");
            navigate("/users");

        } catch (err) {

            const data = err?.response?.data;

            alert(
                getErrorMessage(data, "Delete failed")
            );
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "40px"
        }}>

            <h2>
                {isCreateMode ? "Create user" : "User details"}
            </h2>

            {error && (
                <div style={{ color: "red", marginBottom: "10px" }}>
                    {error}
                </div>
            )}

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "420px"
            }}>

                <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ width: "90px" }}>Name:</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ width: "90px" }}>Email:</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ width: "90px" }}>Role:</label>

                    <select
                        value={role}
                        disabled={user?.id === id}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ flex: 1 }}
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>

            </div>

            <div style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px"
            }}>

                <button onClick={save}>
                    {isCreateMode ? "Create" : "Save"}
                </button>

                {!isCreateMode && (
                    <button onClick={deleteUser} style={{ color: "red" }}>
                        Delete
                    </button>
                )}

            </div>

        </div>
    );
}