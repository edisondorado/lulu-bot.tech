import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_DOMAIN_SERVER
});

export default instance;