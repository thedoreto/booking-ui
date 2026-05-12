import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Customers() {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/customers`)
            .then(res => res.json())
            .then(data => setCustomers(data));
    }, []);

    return (
        <div>
            <h2>Customers</h2>

            <div>
                {customers.map(c => (
                    <Link
                        key={c.id}
                        to={`/customers/${c.id}`}
                        style={{
                            display: "block",
                            padding: "3px 0",
                            color: "#1976d2",
                            textDecoration: "underline"
                        }}
                    >
                        {c.name} ({c.email})
                    </Link>
                ))}
            </div>

            <hr style={{ margin: "12px 0" }} />

            <Link to="/customers/new">
                <button>Add new customer</button>
            </Link>
        </div>
    );
}