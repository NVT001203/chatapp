import Search from "./search";
import Chats from "./chats";
import "../pages/styles/sidebar.scss";

function Sidebar() {
    return (
        <div className="sidebar">
            <h2>Nvt chat</h2>
            <Search />
            <Chats />
        </div>
    );
}

export default Sidebar;
