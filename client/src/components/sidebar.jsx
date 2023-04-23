import Search from "./search";
import Chats from "./chats";
import "../pages/styles/sidebar.scss";

function Sidebar({ data }) {
    const { toast } = data;
    return (
        <div className="sidebar">
            <h2 className="Logo">Nvt chat</h2>
            <Search toast={toast} />
            <Chats toast={toast} />
        </div>
    );
}

export default Sidebar;
