import axios from "axios";

// Езикът, избран в чата (код от списъка, който дава AI асистентът); помни се в браузъра
export const CHAT_LANGUAGE_KEY = "chatLanguage";

const aiApi = axios.create({
    baseURL: import.meta.env.VITE_AI_API_URL
});

// Кой е потребителят, AI асистентът разбира от токена (booking-system го проверява); без токен – гост
aiApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // На кой език да отговаря AI асистентът; без избран – езикът по подразбиране на хотела
    const language = localStorage.getItem(CHAT_LANGUAGE_KEY);
    if (language) {
        config.headers["Accept-Language"] = language;
    }
    return config;
});

export default aiApi;
