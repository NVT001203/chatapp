import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const client_url = process.env.CLIENT_URL;
let users_online = {
    // [socket]: user_id
};

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
            socket.broadcast.to(chat.id).emit("updated-chat", { chat });
        });
        socket.on("message", ({ message, photo, chat }) => {
            socket.broadcast
                .to(message.chat_id)
                .emit("message-receive", { message, chat });
            if (photo) {
                io.to(message.chat_id).emit("photo-receive", {
                    photo: photo,
                    chat,
                });
            }
        });
        socket.on("add-chat", ({ chat, notices, members, members_added }) => {
            const users_id = Object.keys(users_online);
            const sockets = Object.values(users_online);
            members_added.forEach((member) => {
                if (users_id.findIndex((user_id) => user_id == member) != -1) {
                    sockets[
                        users_id.findIndex((user_id) => user_id == member)
                    ].join(chat.id);
                }
            });
            socket.broadcast
                .to(chat.id)
                .emit("added-chat", { chat, notices, members });
        });
        socket.on("remove-member", ({ chat, member, notice }) => {
            const users_id = Object.keys(users_online);
            const sockets = Object.values(users_online);
            socket.broadcast
                .to(chat.id)
                .emit("removed-member", { chat, notice, member });
            if (users_id.includes(member)) {
                console.log("leave");
                sockets[
                    users_id.findIndex((user_id) => user_id == member)
                ].leave(chat.id);
            }
        });
        socket.on("leave-group", ({ chat, notice, member }) => {
            if (Object.keys(users_online).includes(member)) {
                Object.values(users_online)[
                    Object.keys(users_online).findIndex(
                        (user_id) => user_id == member
                    )
                ].leave(chat.id);
            }
            socket.broadcast.to(chat.id).emit("leaved-group", { chat, notice });
        });
        socket.on("add-admin", ({ chat, notice }) => {
            socket.broadcast.to(chat.id).emit("added-admin", { chat, notice });
        });
        socket.on("delete-chat", ({ chat }) => {
            const sockets = Object.values(users_online);
            const users_id = Object.keys(users_online);
            socket.broadcast.to(chat.id).emit("deleted-chat", { chat });

            const users = chat.members;
            users.map((id) => {
                if (users_id.findIndex((user_id) => user_id == id) != -1) {
                    sockets[
                        users_id.findIndex((user_id) => user_id == id)
                    ].leave(chat.id);
                }
            });
        });
        socket.on("user_online", ({ user_id }) => {
            users_online = {
                ...users_online,
                [user_id]: socket,
            };
            const users_id = Object.keys(users_online);
            console.log(users_id);
            console.log("user connected");
        });
        socket.on("disconnect", () => {
            delete users_online[
                Object.keys(users_online)[
                    Object.values(users_online).findIndex(
                        (socketS) => socket.id == socketS.id
                    )
                ]
            ];
            console.log("user disconnected");
        });
    });
};
