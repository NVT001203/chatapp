import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const client_url = process.env.CLIENT_URL;
let users_online = {
    // [user_id]: socket
};

let users_friends = {
    // [user_id]: [...friends_id]
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
        socket.on("add-friend", ({ friend, user }) => {
            if (Object.keys(users_online).includes(friend.friend_id)) {
                socket
                    .to(
                        Object.values(users_online)[
                            Object.keys(users_online).findIndex(
                                (e) => e == friend.friend_id
                            )
                        ].id
                    )
                    .emit("friend-request", { friend, user });
            }
        });
        socket.on("delete-friend", ({ friend, user }) => {
            const friend_id =
                friend.user_id == user.user_id
                    ? friend.friend_id
                    : friend.user_id;
            users_friends = users_friends[user.user_id]
                ? {
                      ...users_friends,
                      [user.user_id]: [
                          ...users_friends[user.user_id]?.filter(
                              (id) => id != friend_id
                          ),
                      ],
                  }
                : { ...users_friends, [user.user_id]: [] };
            socket.emit("friend-off", { friend: friend_id });
            if (Object.keys(users_online).includes(friend_id)) {
                const socket_id =
                    Object.values(users_online)[
                        Object.keys(users_online).findIndex(
                            (e) => e == friend_id
                        )
                    ].id;
                socket.to(socket_id).emit("deleted-friend", { friend });
                socket
                    .to(socket_id)
                    .emit("friend-off", { friend: user.user_id });
            }
        });
        socket.on("accept-friend", ({ friend, user }) => {
            const friend_id =
                friend.user_id == user.user_id
                    ? friend.friend_id
                    : friend.user_id;
            users_friends = users_friends[user.user_id]
                ? {
                      ...users_friends,
                      [user.user_id]: [
                          ...users_friends[user.user_id],
                          friend_id,
                      ],
                  }
                : { ...users_friends, [user.user_id]: [friend_id] };
            if (Object.keys(users_online).includes(friend_id)) {
                const socket_id =
                    Object.values(users_online)[
                        Object.keys(users_online).findIndex(
                            (e) => e == friend_id
                        )
                    ].id;
                socket.to(socket_id).emit("accepted-friend", { friend });
                socket
                    .to(socket_id)
                    .emit("friend_online-receive", { friend: user.user_id });
                socket.emit("friend_online-receive", { friend: friend_id });
            }
        });
        socket.on("friend-online", ({ friends, user_id }) => {
            const users_id = Object.keys(users_online);
            const friends_online = friends.filter((friend) =>
                users_id.includes(friend)
            );
            socket.emit("friends_online-receive", {
                friends: friends_online,
                user_id,
            });
            friends_online.forEach((friend) => {
                users_online[friend] &&
                    users_online[friend].emit("friend_online-receive", {
                        friend: user_id,
                    });
            });
            users_friends[user_id] = friends;
        });

        socket.on("user_online", ({ user_id }) => {
            users_online = {
                ...users_online,
                [user_id]: socket,
            };
            console.log("user connected");
        });
        socket.on("disconnect", () => {
            const user_id =
                Object.keys(users_online)[
                    Object.values(users_online).findIndex(
                        (socketS) => socket.id == socketS.id
                    )
                ];
            users_friends[user_id]?.forEach((friend) => {
                users_online[friend] &&
                    users_online[friend].emit("friend-off", {
                        friend: user_id,
                    });
            });
            delete users_friends[user_id];
            delete users_online[user_id];
            console.log("user disconnected");
        });
    });
};
