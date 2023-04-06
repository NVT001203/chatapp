/* eslint-disable jsx-a11y/alt-text */

import { useEffect, useRef } from "react";
import ImageLoading from "../imgs/ImageLoading.gif";
import More from "../imgs/verticalThreeDot.png";
import Emoji from "../imgs/emoji.png";

function Messages({ data }) {
    const { currentChat, currentUser, store } = data;
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
            <div className="messages">
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
                                            className="message-text"
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
                                            className="message-image"
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
                                            ref={ref}
                                            src={ImageLoading}
                                        />
                                    )}
                                    {/* <div className="bridge"></div>
                                    <div className="message-actions">
                                        <img
                                            className="action-icon"
                                            src={Emoji}
                                        />
                                        <img
                                            className="action-icon more"
                                            src={More}
                                        />
                                    </div> */}
                                </div>
                            );
                        }
                    )}
            </div>
        </div>
    );
}
export default Messages;
