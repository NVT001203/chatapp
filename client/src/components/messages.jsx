const users = {
    1: {
        avatar_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        display_name: "NVT",
    },
    12345: {
        avatar_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
        display_name: "Không phải NVT",
    },
};

const chat = {
    chat_id: "1231",
    name: "Design Team",
    group: false,
    members: ["1", "12345"],
    admins: [],
    background_image:
        "https://images.pexels.com/photos/3680912/pexels-photo-3680912.jpeg?auto=compress&cs=tinysrgb&w=600",
};

const current_user = {
    user_id: "1",
    avatar_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
};
const messages = [
    {
        sender_id: "12345",
        text: "This is message test! Last message",
        file: null,
        photo: null,
    },

    {
        sender_id: "12345",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "1",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "12345",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "1",
        text: null,
        file: null,
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYsVLOl5HgpFfJdWzkHWW4DB1oI_0ENsvq7oAk2auWNw&s",
    },

    {
        sender_id: "12345",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "12345",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "12345",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "1",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "12345",
        text: "This is message test!;laskfl;'dkas;'lfkasl;'kdf';alskdf';laskfdl;'askf'l;askf';lska'fl;ks';fklas'fksl;",
        file: null,
        photo: null,
    },

    {
        sender_id: "12345",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "1",
        text: "This is message test!",
        file: null,
        photo: null,
    },

    {
        sender_id: "12345",
        text: "This is message test!",
        file: null,
        photo: null,
    },
];

function Messages() {
    return (
        <div
            className="messages"
            style={
                chat.background_image && {
                    backgroundImage: `url(${chat.background_image})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }
            }
        >
            {messages.map((message, index) => {
                return (
                    <div
                        key={index}
                        className={`message ${
                            message.sender_id == current_user.user_id && "self"
                        }`}
                    >
                        {message.sender_id != current_user.user_id && (
                            <div
                                className="avatar"
                                style={{
                                    backgroundImage: `url(${
                                        users[message.sender_id].avatar_url
                                    })`,
                                }}
                            ></div>
                        )}
                        {message.text && (
                            <span className="text-message">{message.text}</span>
                        )}
                        {message.file && (
                            <div className="file-message">{message.text}</div>
                        )}
                        {message.photo && <img src={message.photo} />}
                    </div>
                );
            })}
        </div>
    );
}

export default Messages;
