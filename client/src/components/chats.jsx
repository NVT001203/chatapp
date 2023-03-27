import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { ChatContext } from "../contexts/chatContext";
import { StoreContext } from "../contexts/StoreContext";

function Chats() {
    const { store } = useContext(StoreContext);
    const { currentChat, setCurrentChat } = useContext(ChatContext);
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="chats">
            {(Object.keys(store.chats).length > 0 &&
                Object.entries(store.chats).map(([id, data]) => {
                    let avatar = data.chat_avatar;
                    let name = data.name;
                    let updated_at = data.updated_at.split("T")[1];
                    updated_at =
                        updated_at.split(":")[0] +
                        ":" +
                        updated_at.split(":")[1];
                    let last_message = null;
                    if (data.last_message != null) {
                        if (store.messages[data.last_message].text) {
                            last_message = `${
                                store.users[
                                    store.messages[data.last_message].sender
                                ].display_name
                            }: ${store.messages[data.last_message].text}`;
                        } else if (store.messages[data.last_message].photo) {
                            last_message = `${
                                store.users[
                                    store.messages[data.last_message].sender
                                ].display_name
                            } just sent a picture!`;
                        } else {
                            last_message = `${
                                store.users[
                                    store.messages[data.last_message].sender
                                ].display_name
                            } just sent a picture!`;
                        }
                    }
                    if (!data.is_group) {
                        avatar =
                            data.members[0] != currentUser.user_id
                                ? store.users[data.members[0]].avatar_url
                                : store.users[data.members[1]].avatar_url;
                        name =
                            data.members[0] != currentUser.user_id
                                ? store.users[data.members[0]].display_name
                                : store.users[data.members[1]].display_name;
                    }

                    return (
                        <div
                            className={`chat-item ${
                                currentChat?.id == id && "active"
                            }`}
                            key={id}
                            onClick={() =>
                                setCurrentChat({
                                    id,
                                    name,
                                    chat_avatar: avatar,
                                })
                            }
                        >
                            <div
                                className="chat-avatar"
                                style={{
                                    backgroundImage: `url(${avatar})`,
                                }}
                            ></div>
                            <div className="wrapper">
                                <span>{name}</span>
                                <span className="last-message">
                                    {last_message || "Created chat!"}
                                </span>
                            </div>
                            <span className="updated">{updated_at}</span>
                        </div>
                    );
                })) || <div></div>}
        </div>
    );
}

export default Chats;
