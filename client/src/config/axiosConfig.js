import axios from "axios";
import env from "./env.js";

export const publicInstance = axios.create({
    baseURL: `${env.SERVER_HOST}`,
});
export const authInstance = axios.create({
    baseURL: `${env.SERVER_AUTH_HOST}/auth`,
});
export const privateInstance = axios.create({
    baseURL: `${env.SERVER_AUTH_HOST}/auth`,
    withCredentials: true,
});
