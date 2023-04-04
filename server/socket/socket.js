import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const client_url = process.env.CLIENT_URL;
let users_online = {};

export const socketConnect = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [client_url],
        },
    });
    io.on("connection", (socket) => {
        socket.on("join-chats", ({ chats }) => {
            socket.join(chats);
        });
        socket.on("update-chat", ({ chat }) => {
            io.to(chat.id).emit("updated-chat", { chat });
        });
        socket.on("message", ({ message, photo }) => {
            io.to(message.chat_id).emit("message-receive", { message });
            if (photo) {
                io.to(message.chat_id).emit("photo-receive", { photo: photo });
            }
        });
        socket.on("add-chat", ({ chat, notices, members }) => {
            const users = chat.members;
            const ids = Object.keys(users_online);
            const users_id = Object.values(users_online);
            users.map((id) => {
                if (users_id.findIndex((user_id) => user_id == id) != -1) {
                    console.log(id);
                    socket
                        .to(ids[users_id.findIndex((user_id) => user_id == id)])
                        .emit("added-chat", { chat, notices, members });
                }
            });
            // Object.entries(users_online).forEach(([id, user_id]) => {
            //     if (users.includes(user_id))
            //         socket
            //             .to(id)
            //             .emit("added-chat", { chat, notices, members });
            // });
        });
        socket.on("remove-member", ({ chat, member, notice }) => {
            const users = chat.members;
            const ids = Object.keys(users_online);
            const users_id = Object.values(users_online);
            if (users_id.includes(member)) {
                socket
                    .to(ids[users_id.findIndex((user_id) => user_id == member)])
                    .emit("removed-member", { chat, member });
            }
            users.map((id) => {
                if (users_id.findIndex((user_id) => user_id == id) != -1) {
                    socket
                        .to(ids[users_id.findIndex((user_id) => user_id == id)])
                        .emit("removed-member", { chat, notice, member });
                }
            });
        });
        socket.on("delete-chat", ({ chat }) => {
            const users = chat.members;
            const ids = Object.keys(users_online);
            const users_id = Object.values(users_online);

            users.map((id) => {
                if (users_id.findIndex((user_id) => user_id == id) != -1) {
                    socket.id !=
                        ids[users_id.findIndex((user_id) => user_id == id)] &&
                        socket
                            .to(
                                ids[
                                    users_id.findIndex(
                                        (user_id) => user_id == id
                                    )
                                ]
                            )
                            .emit("deleted-chat", { chat });
                }
            });
        });
        socket.on("user_online", ({ user_id }) => {
            users_online = { ...users_online, [socket.id]: user_id };
            console.log(users_online);
        });
        socket.on("disconnect", () => {
            delete users_online[socket.id];
            console.log("user disconnected");
        });
    });
};
