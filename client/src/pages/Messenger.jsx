import Navigate from "../components/navigate";
import Sidebar from "../components/sidebar";
import Chat from "../components/chat";
import ChatInfo from "../components/chatInfo";
import "./styles/messenger.scss";

function Messenger() {
    return (
        <div className="messenger-container">
            <Navigate />
            <Sidebar />
            <Chat />
            <ChatInfo />
        </div>
    );
}

export default Messenger;
