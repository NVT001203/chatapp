import Navbar from "./navbar";
import Messages from "./messages";
import Input from "./input";
import "../pages/styles/chat.scss";
import { useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { ChatContext } from "../contexts/chatContext";
import MessengerWelcome from "./messengerWelcome";

function Chat() {
    const { store, dispatch } = useContext(StoreContext);
    const { currentChat } = useContext(ChatContext);

    return (
        <div className="chat-container">
            {(currentChat && (
                <div>
                    <Navbar chat={currentChat} />
                    <Messages messages={store.messages} />
                    <Input dispatch={dispatch} />
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
