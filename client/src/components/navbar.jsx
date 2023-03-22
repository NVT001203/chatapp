const data = {
    chat_avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
    chat_name: "Design Team",
};

function Navbar() {
    return (
        <div className="navbar">
            <div
                className="chat-avatar"
                style={{ backgroundImage: `url(${data.chat_avatar})` }}
            ></div>
            <div className="navbar-content">
                <span>{data.chat_name}</span>
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
