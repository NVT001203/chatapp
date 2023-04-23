/* eslint-disable jsx-a11y/alt-text */

import { useEffect, useRef, useState } from "react";
import ImageLoading from "../imgs/ImageLoading.gif";
import More from "../imgs/more.png";
import Emoji from "../imgs/emoji.png";
import DeleteMessage from "../imgs/deleteMessage.png";
import EmojiPicker from "emoji-picker-react";
import { socket } from "../socket/socket.js";
import { publicInstance } from "../config/axiosConfig.js";
import { useNavigate } from "react-router-dom";

function Messages({ data }) {
    const { currentChat, currentUser, store, toast, dispatch, refreshToken } =
        data;
    const [showMoreFeature, setShowMoreFeature] = useState(null);
    const [emoji, setEmoji] = useState(false);
    const [showPopularReaction, setShowPopularReaction] = useState(false);
    const [showAllReaction, setShowAllReaction] = useState(false);
    const navigate = useNavigate();
    const ref = useRef();
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [store.messages[currentChat.id]]);
    const sortMessages = (messages) => {
        let objarr = [];
        Object.entries(messages).forEach(([key, value]) => {
            objarr.push([value.created_at, key]);
        });
        return objarr.sort();
    };

    const handleAddReaction = async (reaction, message_id, chat) => {
        try {
            const { data } = await publicInstance.post(
                `message/${message_id}/add_reaction`,
                {
                    reaction,
                    member: currentUser.user_id,
                }
            );
            const { message } = data.elements;
            dispatch({
                type: "ADD_MESSAGE",
                message,
            });
            socket.emit("message", { message, chat });
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.post(
                            `message/${message_id}/add_reaction`,
                            {
                                reaction,
                                member: currentUser.user_id,
                            }
                        );
                        const { message } = data.elements;
                        dispatch({
                            type: "ADD_MESSAGE",
                            message,
                        });
                        socket.emit("message", { message, chat });
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
                        } else {
                            toast(
                                "The login session has expired! Please login again."
                            );
                            setTimeout(() => {
                                navigate("/login");
                            }, 6000);
                        }
                    });
            } else {
                toast("Server error! Please try again.");
            }
        }
    };

    const handleRemoveReaction = async (message_id, chat, reaction) => {
        if (currentUser.user_id != reaction.split(" ")[1]) return;
        try {
            const { data } = await publicInstance.put(
                `message/${message_id}/remove_reaction`,
                {
                    member: currentUser.user_id,
                }
            );
            const { message } = data.elements;
            dispatch({
                type: "ADD_MESSAGE",
                message,
            });
            socket.emit("message", { message, chat });
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.put(
                            `message/${message_id}/remove_reaction`,
                            {
                                member: currentUser.user_id,
                            }
                        );
                        const { message } = data.elements;
                        dispatch({
                            type: "ADD_MESSAGE",
                            message,
                        });
                        socket.emit("message", { message, chat });
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
                        } else {
                            toast(
                                "The login session has expired! Please login again."
                            );
                            setTimeout(() => {
                                navigate("/login");
                            }, 6000);
                        }
                    });
            } else {
                toast("Server error! Please try again.");
            }
        }
    };

    const handleDeleteMessage = async (message_id, chat, member) => {
        try {
            const { data } = await publicInstance.put(
                `message/${chat.id}/recall_message`,
                {
                    message: message_id,
                    member: member,
                }
            );
            const { message } = data.elements;
            dispatch({
                type: "ADD_MESSAGE",
                message,
            });
            socket.emit("message", { message, chat });
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.put(
                            `message/${chat.id}/recall_message`,
                            {
                                message: message_id,
                                member,
                            }
                        );
                        const { message } = data.elements;
                        dispatch({
                            type: "ADD_MESSAGE",
                            message,
                        });
                        socket.emit("message", { message, chat });
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
                        } else {
                            toast(
                                "The login session has expired! Please login again."
                            );
                            setTimeout(() => {
                                navigate("/login");
                            }, 6000);
                        }
                    });
            } else if (data?.message == "Only members have this permission") {
                toast(data.message);
            } else {
                toast("Server error! Please try again.");
            }
        }
    };

    return (
        <div
            style={
                (store.chats[currentChat.id].background_image && {
                    backgroundImage: `url(${
                        store.chats[currentChat.id].background_image
                    })`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }) || { backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }
            className="messages-wrapper"
        >
            <div
                className="messages"
                onClick={() => {
                    setShowMoreFeature(null);
                    setShowPopularReaction(false);
                    setEmoji(false);
                }}
            >
                {store.messages[currentChat.id] &&
                    store.chats[currentChat.id].members.includes(
                        currentUser.user_id
                    ) &&
                    sortMessages(store.messages[currentChat.id]).map(
                        ([created_at, key]) => {
                            if (store.messages[currentChat.id][key].notice) {
                                let updated_at = new Date(
                                    store.messages[currentChat.id][
                                        key
                                    ].created_at.split(".")[0]
                                );
                                const hour = (updated_at.getHours() + 7) % 24;
                                created_at =
                                    `${
                                        (`${hour}`.length == 2 && hour) ||
                                        `0${hour}`
                                    }` +
                                    ":" +
                                    `${
                                        (`${updated_at.getMinutes()}`.length ==
                                            2 &&
                                            updated_at.getMinutes()) ||
                                        `0${updated_at.getMinutes()}`
                                    } ${updated_at.getDay()}-${updated_at.getMonth()}-${updated_at.getFullYear()}`;
                                const text_arr =
                                    store.messages[currentChat.id][
                                        key
                                    ].text.split("/u");
                                if (
                                    store.messages[currentChat.id][key]
                                        .chat_created
                                ) {
                                    return (
                                        <div
                                            key={key}
                                            className="notice-wrapper"
                                        >
                                            <span className="notice">
                                                {store.users[
                                                    store.messages[
                                                        currentChat.id
                                                    ][key].sender
                                                ].display_name +
                                                    " created a chat"}{" "}
                                                {created_at}
                                            </span>
                                        </div>
                                    );
                                } else if (!text_arr[1]) {
                                    return (
                                        <div
                                            key={key}
                                            className="notice-wrapper"
                                        >
                                            <span className="notice">
                                                {
                                                    store.messages[
                                                        currentChat.id
                                                    ][key].text
                                                }{" "}
                                                {created_at}
                                            </span>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={key} className="notice-wrapper">
                                        <span className="notice">
                                            {store.users[
                                                store.messages[currentChat.id][
                                                    key
                                                ].sender
                                            ].display_name +
                                                ` ${
                                                    text_arr[0] +
                                                    store.users[text_arr[1]]
                                                        .display_name +
                                                    text_arr[2]
                                                }`}{" "}
                                            {created_at}
                                        </span>
                                    </div>
                                );
                            }
                            return (
                                <div
                                    key={key}
                                    className={`message ${
                                        store.messages[currentChat.id][key]
                                            .sender == currentUser.user_id &&
                                        "self"
                                    }`}
                                    ref={ref}
                                >
                                    {store.messages[currentChat.id][key]
                                        .sender != currentUser.user_id && (
                                        <div
                                            className="avatar"
                                            style={{
                                                backgroundImage: `url(${
                                                    store.users[
                                                        store.messages[
                                                            currentChat.id
                                                        ][key].sender
                                                    ].avatar_url
                                                })`,
                                            }}
                                        ></div>
                                    )}
                                    {store.messages[currentChat.id][key]
                                        .text && (
                                        <span
                                            ref={ref}
                                            className={
                                                store.messages[currentChat.id][
                                                    key
                                                ].recall
                                                    ? "recall message-text"
                                                    : "message-text"
                                            }
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                !store.messages[currentChat.id][
                                                    key
                                                ].recall &&
                                                    setShowMoreFeature(
                                                        (pre) => {
                                                            if (key == pre)
                                                                return null;
                                                            else return key;
                                                        }
                                                    );
                                            }}
                                        >
                                            {
                                                store.messages[currentChat.id][
                                                    key
                                                ].text
                                            }
                                        </span>
                                    )}
                                    {store.messages[currentChat.id][key]
                                        .photo_url && (
                                        <img
                                            ref={ref}
                                            className="message-image"
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowMoreFeature((pre) => {
                                                    if (key == pre) return null;
                                                    else return key;
                                                });
                                            }}
                                            src={
                                                store.messages[currentChat.id][
                                                    key
                                                ].photo_url
                                            }
                                        />
                                    )}
                                    {store.messages[currentChat.id][key]
                                        .loading_photo && (
                                        <img
                                            className="message-image"
                                            src={ImageLoading}
                                        />
                                    )}
                                    {store.messages[currentChat.id] &&
                                        store.messages[currentChat.id][key] &&
                                        store.messages[currentChat.id][key]
                                            ?.reactions &&
                                        Object.keys(
                                            store.messages[currentChat.id][key]
                                                ?.reactions
                                        ).length > 0 && (
                                            <div
                                                className="reaction-wrapper"
                                                onClick={() => {
                                                    setShowAllReaction(key);
                                                }}
                                            >
                                                {store.messages[currentChat.id][
                                                    key
                                                ]?.reactions.map((reaction) => {
                                                    return (
                                                        <span
                                                            className="reaction"
                                                            key={reaction}
                                                        >
                                                            {
                                                                reaction.split(
                                                                    " "
                                                                )[0]
                                                            }
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    {showMoreFeature &&
                                        showMoreFeature == key && (
                                            <div
                                                className="message-actions"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <div className="wrapper">
                                                    <div className="icon-wrapper">
                                                        <img
                                                            className="action-icon"
                                                            src={Emoji}
                                                            onClick={() => {
                                                                setShowPopularReaction(
                                                                    (pre) =>
                                                                        !pre
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="icon-wrapper">
                                                        <img
                                                            className="action-icon delete-message"
                                                            src={DeleteMessage}
                                                            onClick={() => {
                                                                handleDeleteMessage(
                                                                    key,
                                                                    currentChat,
                                                                    currentUser.user_id
                                                                );
                                                                setShowMoreFeature(
                                                                    false
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {showPopularReaction && (
                                                    <div className="popular-reaction">
                                                        <span
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddReaction(
                                                                    "😁",
                                                                    key,
                                                                    currentChat
                                                                );
                                                                setShowPopularReaction(
                                                                    false
                                                                );
                                                                setShowMoreFeature(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            😁
                                                        </span>
                                                        <span
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddReaction(
                                                                    "😄",
                                                                    key,
                                                                    currentChat
                                                                );
                                                                setShowPopularReaction(
                                                                    false
                                                                );
                                                                setShowMoreFeature(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            😄
                                                        </span>
                                                        <span
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddReaction(
                                                                    "😍",
                                                                    key,
                                                                    currentChat
                                                                );
                                                                setShowPopularReaction(
                                                                    false
                                                                );
                                                                setShowMoreFeature(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            😍
                                                        </span>
                                                        <span
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddReaction(
                                                                    "😅",
                                                                    key,
                                                                    currentChat
                                                                );
                                                                setShowPopularReaction(
                                                                    false
                                                                );
                                                                setShowMoreFeature(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            😅
                                                        </span>
                                                        <span
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddReaction(
                                                                    "😭",
                                                                    key,
                                                                    currentChat
                                                                );
                                                                setShowPopularReaction(
                                                                    false
                                                                );
                                                                setShowMoreFeature(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            😭
                                                        </span>
                                                        <span
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddReaction(
                                                                    "😱",
                                                                    key,
                                                                    currentChat
                                                                );
                                                                setShowPopularReaction(
                                                                    false
                                                                );
                                                                setShowMoreFeature(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            😱
                                                        </span>
                                                        <img
                                                            src={More}
                                                            className="more"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                setEmoji(
                                                                    (pre) =>
                                                                        !pre
                                                                );
                                                            }}
                                                        />
                                                        {emoji && (
                                                            <div
                                                                className="emoji-picker"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <EmojiPicker
                                                                    emojiStyle="native"
                                                                    searchDisabled={
                                                                        true
                                                                    }
                                                                    previewConfig={{
                                                                        showPreview: false,
                                                                    }}
                                                                    onEmojiClick={(
                                                                        e
                                                                    ) =>
                                                                        handleAddReaction(
                                                                            `${e.emoji}`,
                                                                            key,
                                                                            currentChat
                                                                        )
                                                                    }
                                                                    height={
                                                                        "auto"
                                                                    }
                                                                    width="auto"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    {showAllReaction == key && (
                                        <div className="all_reaction-container">
                                            <span className="title">
                                                All reactions
                                            </span>
                                            <div className="all_reaction">
                                                {store.messages[
                                                    currentChat.id
                                                ] &&
                                                    store.messages[
                                                        currentChat.id
                                                    ][key] &&
                                                    store.messages[
                                                        currentChat.id
                                                    ][key]?.reactions &&
                                                    store.messages[
                                                        currentChat.id
                                                    ][key]?.reactions.map(
                                                        (reaction) => {
                                                            return (
                                                                <div
                                                                    className="item"
                                                                    key={
                                                                        reaction
                                                                    }
                                                                    onClick={() => {
                                                                        handleRemoveReaction(
                                                                            key,
                                                                            currentChat,
                                                                            reaction
                                                                        );
                                                                    }}
                                                                >
                                                                    <span
                                                                        className="reaction"
                                                                        key={
                                                                            reaction
                                                                        }
                                                                    >
                                                                        {
                                                                            reaction.split(
                                                                                " "
                                                                            )[0]
                                                                        }
                                                                    </span>
                                                                    <span className="name">
                                                                        {
                                                                            store
                                                                                .users[
                                                                                reaction.split(
                                                                                    " "
                                                                                )[1]
                                                                            ]
                                                                                .display_name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                            <span
                                                className="x-symbol"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowAllReaction(false);
                                                }}
                                            >
                                                ✗
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}
            </div>
        </div>
    );
}
export default Messages;
