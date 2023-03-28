/* eslint-disable jsx-a11y/alt-text */

import { useEffect, useRef } from "react";
import ImageLoading from "../imgs/ImageLoading.gif";

function Messages({ data }) {
    const { currentChat, currentUser, store } = data;
    const ref = useRef();
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [store.messages[currentChat.id]]);
    const sortMessages = (messages) => {
        let objsort = {};
        Object.entries(messages).forEach(([key, value]) => {
            objsort[value.created_at] = key;
        });
        return Object.entries(objsort).sort();
    };

    return (
        <div
            style={
                (currentChat.background_image && {
                    backgroundImage: `url(${currentChat.background_image})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }) || { backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }
            className="messages-wrapper"
        >
            <div className="messages">
                {store.messages[currentChat.id] &&
                    currentChat.members.includes(currentUser.user_id) &&
                    sortMessages(store.messages[currentChat.id]).map(
                        ([created_at, key]) => {
                            return (
                                <div
                                    key={key}
                                    className={`message ${
                                        store.messages[currentChat.id][key]
                                            .sender == currentUser.user_id &&
                                        "self"
                                    }`}
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
                                            className="text-message"
                                        >
                                            {
                                                store.messages[currentChat.id][
                                                    key
                                                ].text
                                            }
                                        </span>
                                    )}
                                    {store.messages[currentChat.id][key]
                                        .file_url && (
                                        <div ref={ref} className="file-message">
                                            {
                                                store.messages[currentChat.id][
                                                    key
                                                ].file_url
                                            }
                                        </div>
                                    )}
                                    {store.messages[currentChat.id][key]
                                        .photo_url && (
                                        <img
                                            ref={ref}
                                            src={
                                                store.messages[currentChat.id][
                                                    key
                                                ].photo_url
                                            }
                                        />
                                    )}
                                    {store.messages[currentChat.id][key]
                                        .loading_photo && (
                                        <img ref={ref} src={ImageLoading} />
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
