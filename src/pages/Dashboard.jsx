import useAuth from "../auth/useAuth";
import ChatWindow from "../components/ChatWindow";

export default function Dashboard() {

    const { user, logout, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <p>Loading user...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px" }}>

            <h1>Dashboard</h1>

            {user ? (
                <>
                    <p>Name: {user.name || "-"}</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <p>User ID: {user.id}</p>
                    <ChatWindow user={user} />
                </>
            ) : (
                <p>No user loaded</p>
            )}

            <button onClick={logout}>
                Logout
            </button>

        </div>
    );
}