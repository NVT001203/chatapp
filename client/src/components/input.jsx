import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicInstance } from "../config/axiosConfig";
import { AuthContext } from "../contexts/authContext";
import Emoji from "../imgs/emoji.png";
import Send from "../imgs/send.png";
import Micro from "../imgs/microphone.png";
import Image from "../imgs/image.png";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import { socket } from "../socket/socket";
import EmojiPicker from "emoji-picker-react";

function Input({ data }) {
    const [text, setText] = useState("");
    const [emoji, setEmoji] = useState(false);
    const { dispatch, currentChat, toast, setCurrentChat, store } = data;
    const { refreshToken, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleSend = async (e, click) => {
        if (e.keyCode == 13 || click) {
            setText("");
            try {
                const { data } = await publicInstance.post(
                    `/message/${currentChat.id}/add_message`,
                    {
                        text,
                    }
                );
                if (data.status == "success") {
                    dispatch({
                        type: "ADD_MESSAGE",
                        message: data.elements.message.message,
                    });
                    dispatch({
                        type: "ADD_CHATS",
                        chats: { [data.elements.chat.id]: data.elements.chat },
                    });
                    setCurrentChat(data.elements.chat);
                    socket.emit("message", {
                        message: data.elements.message.message,
                        chat: data.elements.chat,
                    });
                } else {
                    return toast("Something went wrong! Please try again.");
                }
            } catch (e) {
                if (e.response?.data?.message == "jwt expired") {
                    await refreshToken()
                        .then(async (d) => {
                            const { data } = await publicInstance.post(
                                `/message/${currentChat.id}/add_message`,
                                {
                                    text,
                                }
                            );
                            if (data.status == "success") {
                                dispatch({
                                    type: "ADD_MESSAGE",
                                    message: data.elements.message.message,
                                });
                                dispatch({
                                    type: "ADD_CHATS",
                                    chats: {
                                        [data.elements.chat.id]:
                                            data.elements.chat,
                                    },
                                });
                                setCurrentChat(data.elements.chat);
                                socket.emit("message", {
                                    message: data.elements.message.message,
                                    chat: data.elements.chat,
                                });
                            } else {
                                return toast(
                                    "Something went wrong! Please try again."
                                );
                            }
                        })
                        .catch((e) => {
                            navigate("/login");
                        });
                } else {
                    return toast("Something went wrong! Please try again.");
                }
            }
        }
    };

    const handleSendImage = async (e) => {
        const id = uuidv4();
        try {
            const date = new Date(Date.now());
            const IsoFormat = date.toISOString();
            dispatch({
                type: "ADD_MESSAGE",
                message: {
                    id,
                    loading_photo: true,
                    chat_id: currentChat.id,
                    created_at: IsoFormat,
                    sender: currentUser.user_id,
                },
            });
            const file = e.target.files[0];
            const storageRef = ref(storage, id);
            const uploadTask = await uploadBytesResumable(storageRef, file);
            const photo_url = await getDownloadURL(storageRef);
            try {
                const { data } = await publicInstance.post(
                    `/message/${currentChat.id}/add_message`,
                    {
                        photo_url,
                    }
                );
                if (data.status == "success") {
                    dispatch({
                        type: "ADD_MESSAGE_DONE",
                        id,
                        message: data.elements.message.message,
                    });
                    dispatch({
                        type: "ADD_CHATS",
                        chats: {
                            [data.elements.chat.id]: data.elements.chat,
                        },
                    });
                    dispatch({
                        type: "ADD_PHOTO",
                        photo: data.elements.message.photo,
                    });
                    socket.emit("message", {
                        message: data.elements.message.message,
                        photo: data.elements.message.photo,
                        chat: data.elements.chat,
                    });
                    setCurrentChat(data.elements.chat);
                } else {
                    dispatch({
                        type: "REMOVE_MESSAGE_FAILURE",
                        id,
                        message: {
                            id,
                            chat_id: currentChat.id,
                        },
                    });
                    return toast("Something went wrong! Please try again.");
                }
            } catch (e) {
                if (e.response.data.message == "jwt expired") {
                    await refreshToken()
                        .then(async (d) => {
                            const { data } = await publicInstance.post(
                                `/message/${currentChat.id}/add_message`,
                                {
                                    photo_url,
                                }
                            );
                            if (data.status == "success") {
                                dispatch({
                                    type: "ADD_MESSAGE_DONE",
                                    id,
                                    message: data.elements.message.message,
                                });
                                dispatch({
                                    type: "ADD_CHATS",
                                    chats: {
                                        [data.elements.chat.id]:
                                            data.elements.chat,
                                    },
                                });
                                dispatch({
                                    type: "ADD_PHOTO",
                                    photo: data.elements.message.photo,
                                });
                                socket.emit("message", {
                                    message: data.elements.message.message,
                                    photo: data.elements.message.photo,
                                    chat: data.elements.chat,
                                });
                                setCurrentChat(data.elements.chat);
                            } else {
                                dispatch({
                                    type: "REMOVE_MESSAGE_FAILURE",
                                    id,
                                    message: {
                                        id,
                                        chat_id: currentChat.id,
                                    },
                                });

                                toast(
                                    "The login session has expired! Please login again."
                                );
                                setTimeout(() => {
                                    navigate("/login");
                                }, 6000);
                            }
                        })
                        .catch((e) => {
                            dispatch({
                                type: "REMOVE_MESSAGE_FAILURE",
                                id,
                                message: {
                                    id,
                                    chat_id: currentChat.id,
                                },
                            });

                            toast(
                                "The login session has expired! Please login again."
                            );
                            setTimeout(() => {
                                navigate("/login");
                            }, 6000);
                        });
                } else {
                    dispatch({
                        type: "REMOVE_MESSAGE_FAILURE",
                        id,
                        message: {
                            id,
                            chat_id: currentChat.id,
                        },
                    });
                    return toast("Something went wrong! Please try again.");
                }
            }
        } catch (e) {
            dispatch({
                type: "REMOVE_MESSAGE_FAILURE",
                id,
                message: {
                    id,
                    chat_id: currentChat.id,
                },
            });
            toast("Something went wrong! Please try again.");
        }
    };

    return (
        <div className="input-container">
            <div className="input-wrapper" onClick={() => setEmoji(false)}>
                <img
                    className="emoji"
                    src={Emoji}
                    onClick={(e) => {
                        e.stopPropagation();
                        setEmoji((pre) => !pre);
                    }}
                />
                {emoji && (
                    <div
                        className="emoji-picker"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <EmojiPicker
                            emojiStyle="native"
                            searchDisabled={true}
                            previewConfig={{ showPreview: false }}
                            onEmojiClick={(e) =>
                                setText((input) => input + e.emoji)
                            }
                            height={"auto"}
                            width="auto"
                        />
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Your message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleSend}
                />
                <div className="wrapper">
                    <img src={Micro} className="icon micro" />
                    <label htmlFor="image">
                        <img src={Image} className="icon image" />
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        style={{ display: "none" }}
                        accept="image/png, image/gif, image/jpeg"
                        onChange={handleSendImage}
                    />
                    <div className="send-wrapper">
                        <img
                            src={Send}
                            onClick={(e) => handleSend(e, "click")}
                            className="icon send"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Input;
