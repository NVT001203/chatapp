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
    const navigate = useNavigate();

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
                        const { chats, messages, users } = data.elements;
                        const chatsObj = {};
                        const chatsArr = [];
                        for (const chat of chats) {
                            chatsObj[chat.id] = chat;
                            chatsArr.push(chat.id);
                        }
                        const usersObj = {};
                        for (const user of users) {
                            usersObj[user.user_id] = user;
                        }
                        dispatch({
                            type: "ADD_CHATS",
                            chats: chatsObj,
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
                                const { chats, messages, users } =
                                    data.elements;
                                const chatsObj = {};
                                const chatsArr = [];
                                for (const chat of chats) {
                                    chatsObj[chat.id] = chat;
                                    chatsArr.push(chat.id);
                                }
                                const usersObj = {};
                                for (const user of users) {
                                    usersObj[user.user_id] = user;
                                }
                                dispatch({
                                    type: "ADD_CHATS",
                                    chats: chatsObj,
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
                        console.log({ pre });
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
                    console.log({ pre });
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

    return (
        <div>
            {(!loading && (
                <div
                    className="messenger-container"
                    style={{ position: "relative" }}
                >
                    <Navigate toast={toast} />
                    <Sidebar toast={toast} />
                    <Chat data={{ toast, hidden, setHidden }} />
                    <ChatInfo
                        data={{
                            toast,
                            hidden,
                            setHidden,
                            currentUser,
                            refreshToken,
                        }}
                    />
                </div>
            )) || <LoadingResource />}
            <ToastContainer />
        </div>
    );
}

export default Messenger;
