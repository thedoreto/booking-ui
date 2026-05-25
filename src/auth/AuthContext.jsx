import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => token;

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    useEffect(() => {

        // 🔥 interceptor setup (ONCE)
        const requestInterceptor = api.interceptors.request.use((config) => {

            const token = getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        });

        const responseInterceptor = api.interceptors.response.use(
            (res) => res,
            (err) => {
                if (err?.response?.status === 401) {
                    logout();
                }
                return Promise.reject(err);
            }
        );

        // 🔥 init auth
        const initAuth = async () => {

            const t = localStorage.getItem("token");

            if (!t) {
                setLoading(false);
                return;
            }

            try {
                setToken(t);

                const res = await api.get("/me");
                setUser(res.data);

            } catch (err) {
                logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // 🔥 cleanup
        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };

    }, []);

    const login = async (newToken) => {

        localStorage.setItem("token", newToken);
        setToken(newToken);

        try {
            const res = await api.get("/me");
            setUser(res.data);
        } catch (err) {
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}