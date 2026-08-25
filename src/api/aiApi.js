import axios from "axios";

const aiApi = axios.create({
    baseURL: "http://localhost:8081"
});

export default aiApi;