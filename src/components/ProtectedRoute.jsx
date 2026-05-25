//src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function ProtectedRoute({ children }) {

    const { user, loading } = useAuth();

    // докато чакаме /me да се върне
    if (loading) {
        return null; // можеш да сложиш spinner ако искаш
    }

    // ако няма user -> не е логнат
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}