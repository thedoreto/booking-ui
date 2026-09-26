import axios from "axios";

const aiApi = axios.create({
    baseURL: import.meta.env.VITE_AI_API_URL
});

// Кой е потребителят, AI асистентът разбира от токена (booking-system го проверява); без токен – гост
aiApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default aiApi;
