/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

function Navbar({ data }) {
    const { currentChat, currentUser, store } = data;
    const [avatar, setAvatar] = useState(currentChat.chat_avatar);
    const [name, setName] = useState(currentChat.chat_avatar);
    useEffect(() => {
        if (!currentChat.is_group) {
            setAvatar(
                // eslint-disable-next-line eqeqeq
                currentChat.members[0] != currentUser.user_id
                    ? store.users[currentChat.members[0]].avatar_url
                    : store.users[currentChat.members[1]].avatar_url
            );
            setName(
                // eslint-disable-next-line eqeqeq
                currentChat.members[0] != currentUser.user_id
                    ? store.users[currentChat.members[0]].display_name
                    : store.users[currentChat.members[1]].display_name
            );
        }
    }, [
        currentChat,
        currentUser,
        store.users[currentChat.members[0]]?.display_name,
        store.users[currentChat.members[0]]?.avatar_url,
        store.users[currentChat.members[1]]?.avatar_url,
        store.users[currentChat.members[1]]?.display_name,
    ]);
    return (
        <div className="navbar">
            <div
                className="chat-avatar"
                style={{ backgroundImage: `url(${avatar})` }}
            ></div>
            <div className="navbar-content">
                <span>{name}</span>
            </div>
            <div className="more-wrapper">
                <div className="icon video"></div>
                <div className="icon phone"></div>
                <div className="icon more"></div>
            </div>
        </div>
    );
}

export default Navbar;
