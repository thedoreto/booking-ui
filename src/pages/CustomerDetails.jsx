import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function CustomerDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const isCreateMode = !id || id === "new";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

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

        fetch(`${API_URL}/customers/${id}`)
            .then(async (res) => {

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        getErrorMessage(data, "Failed to load customer")
                    );
                }

                return data;
            })
            .then(data => {

                setName(data.name ?? "");
                setEmail(data.email ?? "");

            })
            .catch(err => alert(err.message));

    }, [id]);

    const save = () => {

        const url = isCreateMode
            ? `${API_URL}/customers`
            : `${API_URL}/customers/${id}`;

        const method = isCreateMode ? "POST" : "PUT";

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email })
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
                        ? "Customer created!"
                        : "Customer updated!"
                );

                navigate("/customers");

            })
            .catch(err => alert(err.message));
    };

    const deleteCustomer = () => {

        if (!window.confirm("Delete this customer?")) return;

        fetch(`${API_URL}/customers/${id}`, {
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

                alert("Customer deleted!");

                navigate("/customers");

            })
            .catch(err => alert(err.message));
    };

    return (
        <div>

            <h2>
                {isCreateMode
                    ? "Create customer"
                    : "Customer details"}
            </h2>

            <div>
                <label>Name:</label>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div>
                <label>Email:</label>

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div
                style={{
                    marginTop: "10px",
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
                        onClick={deleteCustomer}
                        style={{ color: "red" }}
                    >
                        Delete
                    </button>
                )}

            </div>

        </div>
    );
}