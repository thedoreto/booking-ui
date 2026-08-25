import axios from "axios";

const aiApi = axios.create({
    baseURL: import.meta.env.VITE_AI_API_URL
});

export default aiApi;