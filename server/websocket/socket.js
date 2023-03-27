import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const client_host = process.env.CLIENT_URL;
let users_online = {};

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
        socket.on("add-user", ({ user_id }) => {
            users_online = { ...users_online, [socket.id]: user_id };
            console.log(users_online);
        });
        socket.on("disconnect", () => {
            delete users_online[socket.id];
            console.log("user disconnected");
        });
    });
};
