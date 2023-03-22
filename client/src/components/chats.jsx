const demoData = [
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
    {
        last_message: "trangnv: co cai lon bo may",
        chat_name: "Design team",
        chat_avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        updated: "12:31",
    },
];

function Chats() {
    return (
        <div className="chats">
            {demoData &&
                demoData.map((data, index) => {
                    return (
                        <div className="chat-item" key={index}>
                            <div
                                className="chat-avatar"
                                style={{
                                    backgroundImage: `url(${data.chat_avatar})`,
                                }}
                            ></div>
                            <div className="wrapper">
                                <span>{data.chat_name}</span>
                                <span className="last-message">
                                    {data.last_message}
                                </span>
                            </div>
                            <span className="updated">{data.updated}</span>
                        </div>
                    );
                })}
        </div>
    );
}

export default Chats;
