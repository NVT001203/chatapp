import Navigate from "../components/navigate";
import Sidebar from "../components/sidebar";
import Chat from "../components/chat";
import ChatInfo from "../components/chatInfo";
import "./styles/messenger.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../contexts/StoreContext";
import { publicInstance } from "../config/axiosConfig";
import LoadingResource from "../components/loadingResource";
import { ToastContainer, toast } from "react-toastify";
import { socket } from "../socket/socket";
import { ChatContext } from "../contexts/chatContext";

function Messenger() {
    const {
        currentUser,
        refreshToken,
        getUser,
        setCurrentUser,
        currentSocket,
    } = useContext(AuthContext);
    const [hidden, setHidden] = useState(true);
    const { dispatch, store, sortChats } = useContext(StoreContext);
    const { setCurrentChat, currentChat } = useContext(ChatContext);
    const [loading, setLoading] = useState(true);
    const [newRequest, setNewRequest] = useState(false);
    const [firstMount, setFirstMount] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const onSocket = () => {
            socket.on("message-receive", ({ message, chat }) => {
                dispatch({
                    type: "ADD_MESSAGE",
                    message: message,
                });
                dispatch({
                    type: "ADD_CHATS",
                    chats: {
                        [chat.id]: chat,
                    },
                });
            });
            socket.on("photo-receive", ({ photo }) => {
                dispatch({
                    type: "ADD_PHOTO",
                    photo,
                });
            });
            socket.on("added-chat", ({ chat, notices, members }) => {
                dispatch({
                    type: "ADD_USERS",
                    users: members,
                });
                dispatch({
                    type: "ADD_CHATS",
                    chats: {
                        [chat.id]: chat,
                    },
                });
                dispatch({
                    type: "ADD_MESSAGES",
                    messages: notices,
                });
            });
            socket.on("removed-member", ({ member, chat, notice }) => {
                if (member == currentUser.user_id) {
                    dispatch({
                        type: "LEAVE_GROUP",
                        chat_id: chat.id,
                        user_id: member,
                    });

                    setCurrentChat((pre) => {
                        if (pre?.id != chat.id) return pre;
                        else
                            return Object.keys(store.chats).filter(
                                (id) => id != pre.id
                            ).length == 0
                                ? undefined
                                : store.chats[
                                      sortChats(store.chats).reverse()[0][1] !=
                                      pre.id
                                          ? sortChats(
                                                store.chats
                                            ).reverse()[0][1]
                                          : sortChats(
                                                store.chats
                                            ).reverse()[1][1]
                                  ];
                    });
                } else {
                    dispatch({
                        type: "ADD_CHATS",
                        chats: { [chat.id]: chat },
                    });
                    dispatch({
                        type: "ADD_MESSAGES",
                        messages: notice,
                    });
                }
            });
            socket.on("friend-request", ({ friend, user }) => {
                dispatch({
                    type: "ADD_USERS",
                    users: { [user.user_id]: user },
                });
                dispatch({
                    type: "ADD_FRIENDS",
                    user_id: user.user_id,
                    friends: {
                        [user.user_id]: {
                            friend_id: friend.user_id,
                            status: "requested",
                        },
                    },
                });
                setNewRequest(true);
            });
            socket.on("deleted-friend", ({ friend }) => {
                dispatch({
                    type: "REMOVE_FRIEND",
                    user_id: currentUser.user_id,
                    friend_id:
                        friend.friend_id == currentUser.user_id
                            ? friend.user_id
                            : friend.friend_id,
                });
            });
            socket.on("accepted-friend", ({ friend }) => {
                console.log({
                    friend,
                    currentUser,
                });
                dispatch({
                    type: "ADD_FRIENDS",
                    user_id: currentUser.user_id,
                    friends: {
                        [friend.friend_id]: {
                            friend_id: friend.friend_id,
                            status: "accept",
                        },
                    },
                });
                setNewRequest(true);
            });
            socket.on("updated-chat", ({ chat }) => {
                dispatch({
                    type: "ADD_CHATS",
                    chats: {
                        [chat.id]: chat,
                    },
                });
            });
            socket.on("added-admin", ({ chat, notice }) => {
                dispatch({
                    type: "ADD_CHATS",
                    chats: {
                        [chat.id]: chat,
                    },
                });
                dispatch({
                    type: "ADD_MESSAGES",
                    messages: [notice],
                });
            });

            socket.on("leaved-group", ({ chat, notice }) => {
                dispatch({
                    type: "ADD_CHATS",
                    chats: {
                        [chat.id]: chat,
                    },
                });
                dispatch({
                    type: "ADD_MESSAGES",
                    messages: [notice],
                });
            });
            socket.on("deleted-chat", ({ chat }) => {
                dispatch({
                    type: "REMOVE_CHAT",
                    chat_id: chat.id,
                });

                setCurrentChat((pre) => {
                    if (pre?.id != chat.id) return pre;
                    else
                        return Object.keys(store.chats).filter(
                            (id) => id != pre.id
                        ).length == 0
                            ? undefined
                            : store.chats[
                                  sortChats(store.chats).reverse()[0][1] !=
                                  pre.id
                                      ? sortChats(store.chats).reverse()[0][1]
                                      : sortChats(store.chats).reverse()[1][1]
                              ];
                });
            });
            socket.on("friends_online-receive", ({ friends, user_id }) => {
                dispatch({
                    type: "ADD_FRIENDS_ONLINE",
                    friends_online: friends,
                    user_id,
                });
            });
            socket.on("friend_online-receive", ({ friend }) => {
                dispatch({
                    type: "ADD_FRIENDS_ONLINE",
                    friends_online: [friend],
                    user_id: currentUser.user_id,
                });
            });
            socket.on("friend-off", ({ friend }) => {
                dispatch({
                    type: "FRIEND_OFF",
                    user_id: currentUser.user_id,
                    friend_off: friend,
                });
            });
        };
        socket.connected && onSocket();
        return () => {
            socket.offAny();
        };
    }, [socket.connected]);
    useEffect(() => {
        const join_chats = () => {
            socket.emit("join-chats", { chats: Object.keys(store.chats) });
        };
        socket.connected && join_chats();
    }, [
        socket.connected,
        currentUser,
        Object.keys(store.chats).length,
        currentSocket,
    ]);
    useEffect(() => {
        if (Object.keys(currentUser).length == 0) {
            getUser()
                .then((user) => {
                    if (user) {
                        dispatch({
                            type: "ADD_USERS",
                            users: { [user.user_id]: user },
                        });
                        setCurrentUser(user);
                    } else {
                        navigate("/login");
                    }
                })
                .catch((e) => {
                    navigate("/login");
                });
        } else {
            try {
                publicInstance
                    .get(`/user/${currentUser.user_id}/get_resource`)
                    .then(({ data }) => {
                        const {
                            chats,
                            messages,
                            users,
                            friends,
                            friends_info,
                            hidden_chats,
                        } = data.elements;
                        const chatsObj = {};
                        for (const chat of chats) {
                            chatsObj[chat.id] = chat;
                        }
                        const usersObj = {};
                        const hiddenChatsObj = {};
                        for (const chat of hidden_chats) {
                            hiddenChatsObj[chat.id] = chat;
                        }
                        for (const user of users) {
                            usersObj[user.user_id] = user;
                        }
                        const friendsObj = {};
                        friends_info.forEach((friend, index) => {
                            usersObj[friend.user_id] = friend;
                        });
                        friends.map((friend, index) => {
                            if (friend.user_id == currentUser.user_id) {
                                friendsObj[friend.friend_id] = {
                                    friend_id: friend.friend_id,
                                    status: friend.status,
                                };
                            } else {
                                if (friend.status == "request")
                                    setNewRequest(true);
                                friendsObj[friend.user_id] = {
                                    friend_id: friend.user_id,
                                    status:
                                        friend.status == "request"
                                            ? "requested"
                                            : friend.status,
                                };
                            }
                        });
                        socket.emit("friend-online", {
                            friends: Object.keys(friendsObj).filter(
                                (friend) =>
                                    friendsObj[friend].status == "accept"
                            ),
                            user_id: currentUser.user_id,
                        });
                        dispatch({
                            type: "ADD_FRIENDS",
                            user_id: currentUser.user_id,
                            friends: friendsObj,
                        });
                        dispatch({
                            type: "ADD_CHATS",
                            chats: chatsObj,
                        });
                        dispatch({
                            type: "ADD_HIDDEN_CHATS",
                            hidden_chats: hiddenChatsObj,
                        });
                        dispatch({
                            type: "ADD_MESSAGES",
                            messages: messages,
                        });
                        dispatch({
                            type: "ADD_USERS",
                            users: usersObj,
                        });
                        setLoading(false);
                    })
                    .catch((e) => {
                        if (
                            e.response?.data?.message != "No token provided" ||
                            e.response?.data?.message != "Unauthorized" ||
                            e.response?.data?.message != "jwt expired"
                        ) {
                            refreshToken().then(async (res) => {
                                const { data } = await publicInstance.get(
                                    `/user/${currentUser.user_id}/get_resource`
                                );
                                const {
                                    chats,
                                    messages,
                                    users,
                                    friends,
                                    friends_info,
                                    hidden_chats,
                                } = data.elements;
                                const chatsObj = {};
                                const hiddenChatsObj = {};
                                for (const chat of hidden_chats) {
                                    hiddenChatsObj[chat.id] = chat;
                                }
                                for (const chat of chats) {
                                    chatsObj[chat.id] = chat;
                                }
                                const usersObj = {};
                                for (const user of users) {
                                    usersObj[user.user_id] = user;
                                }
                                const friendsObj = {};
                                friends_info.forEach((friend, index) => {
                                    usersObj[friend.user_id] = friend;
                                });
                                friends.map((friend, index) => {
                                    if (friend.status == "requested")
                                        setNewRequest(true);
                                    if (friend.user_id == currentUser.user_id) {
                                        friendsObj[friend.friend_id] = {
                                            friend_id: friend.friend_id,
                                            status: friend.status,
                                        };
                                    } else {
                                        friendsObj[friend.user_id] = {
                                            friend_id: friend.user_id,
                                            status:
                                                friend.status == "request"
                                                    ? "requested"
                                                    : friend.status,
                                        };
                                    }
                                });
                                socket.emit("friend-online", {
                                    friends: Object.keys(friendsObj),
                                    user_id: currentUser.user_id,
                                });
                                dispatch({
                                    type: "ADD_FRIENDS",
                                    user_id: currentUser.user_id,
                                    friends: friendsObj,
                                });
                                dispatch({
                                    type: "ADD_CHATS",
                                    chats: chatsObj,
                                });
                                dispatch({
                                    type: "ADD_HIDDEN_CHATS",
                                    hidden_chats: hiddenChatsObj,
                                });
                                dispatch({
                                    type: "ADD_MESSAGES",
                                    messages: messages,
                                });
                                dispatch({
                                    type: "ADD_USERS",
                                    users: usersObj,
                                });
                                setLoading(false);
                            });
                        } else navigate("/loading_error");
                    });
            } catch (e) {
                setLoading(false);
                navigate("/loading_error");
            }
        }
    }, [currentUser.user_id]);

    return (
        <div>
            {(!loading && (
                <div
                    className="messenger-container"
                    style={{ position: "relative" }}
                >
                    <Navigate
                        data={{
                            toast,
                            newRequest,
                            setNewRequest,
                        }}
                    />
                    <Sidebar data={{ toast, store, currentUser }} />
                    <Chat data={{ toast, hidden, setHidden }} />
                    <ChatInfo
                        data={{
                            toast,
                            hidden,
                            setHidden,
                            currentUser,
                            refreshToken,
                            firstMount,
                            setFirstMount,
                        }}
                    />
                </div>
            )) || <LoadingResource />}
            <ToastContainer />
        </div>
    );
}

export default Messenger;
