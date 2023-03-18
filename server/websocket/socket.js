import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const client_host = process.env.CLIENT_URL;

export const websocketConnect = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [client_host],
        },
    });
    io.on("connection", (socket) => {
        console.log("a user connected");
        socket.on("message", (text) => {
            socket.broadcast.emit("message", text);
        });
        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
};
