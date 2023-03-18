import { io } from "socket.io-client";
import variables from "../config/env.js";

const server_url = variables.SERVER_URL;

export const socket = io(server_url, {
    transports: ["websocket"],
});
