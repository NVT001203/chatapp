import Navbar from "./navbar";
import Messages from "./messages";
import Input from "./input";
import "../pages/styles/chat.scss";
import { useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { ChatContext } from "../contexts/chatContext";
import MessengerWelcome from "./messengerWelcome";
import { AuthContext } from "../contexts/authContext";

function Chat({ toast }) {
    const { store, dispatch } = useContext(StoreContext);
    const { currentChat, setCurrentChat } = useContext(ChatContext);
    const { currentUser } = useContext(AuthContext);
    return (
        <div className="chat-container">
            {(currentChat &&
                currentChat.members.includes(currentUser.user_id) && (
                    <div>
                        <Navbar data={{ currentChat, store, currentUser }} />
                        <Messages data={{ currentChat, store, currentUser }} />
                        <Input
                            data={{
                                dispatch,
                                currentChat,
                                currentUser,
                                toast,
                                setCurrentChat,
                                store,
                            }}
                        />
                    </div>
                )) || (
                <div className="welcome">
                    {" "}
                    <MessengerWelcome />
                </div>
            )}
        </div>
    );
}

export default Chat;
