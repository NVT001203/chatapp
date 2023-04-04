import axios from "axios";
import env from "./env.js";

export const publicInstance = axios.create({
    baseURL: `${env.SERVER_URL}`,
});
export const authInstance = axios.create({
    baseURL: `${env.SERVER_AUTH_URL}/auth`,
});
export const privateInstance = axios.create({
    baseURL: `${env.SERVER_AUTH_URL}/auth`,
    withCredentials: true,
});
