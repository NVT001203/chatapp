import Navbar from "./navbar";
import Messages from "./messages";
import Input from "./input";
import "../pages/styles/chat.scss";

function Chat() {
    return (
        <div className="chat-container">
            <Navbar />
            <Messages />
            <Input />
        </div>
    );
}

export default Chat;
