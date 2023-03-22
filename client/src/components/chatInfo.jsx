import { useState } from "react";
import "../pages/styles/chatInfo.scss";
const chat = {
    chat_id: "1231",
    name: "Design Team",
    group: false,
    members: ["1", "12345"],
    admins: [],
    background_image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
};

const users = {
    1: {
        display_name: "NVT",
        avatar_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
    },
    12345: {
        display_name: "Không phải NVT",
        avatar_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
    },
};

const photos = {
    1231: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fff2lftqIE077pFAKU1Mhbcj8YFvBbMvpA&usqp=CAU",
    ],
};

function ChatInfo() {
    const [hidden, setHidden] = useState(true);

    return (
        <div className={hidden ? "info-container hidden" : "info-container"}>
            <div className="chat-title">
                <span>{chat.name}</span>
                <div className="close" onClick={() => setHidden(true)}></div>
            </div>
            <div className="members">
                <div className="title">
                    <div>
                        <div className="friends"></div>
                        <span>MEMBER ({chat.members.length})</span>
                    </div>
                    <span>Show All</span>
                </div>
                {chat.members.map((member, index) => {
                    return (
                        <div key={index} className="member-info">
                            <div className="wrapper">
                                <div
                                    className="avatar"
                                    style={{
                                        backgroundImage: `url(${users[member].avatar_url})`,
                                    }}
                                ></div>
                                <span className="member-name">
                                    {users[member].display_name}
                                </span>
                            </div>
                            <div>
                                <div className="video"></div>
                                <div className="message"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="media-wrapper">
                <div className="media-title">
                    <div>
                        <div className="image"></div>
                        <span>MEDIA ({photos[chat.chat_id].length})</span>
                    </div>
                    <span>Show All</span>
                </div>
                <div className="medias">
                    {(photos[chat.chat_id][0] && (
                        <div
                            style={{
                                backgroundImage: `url(${
                                    photos[chat.chat_id][0]
                                })`,
                            }}
                        ></div>
                    )) || <span className="no-media">No media</span>}
                    {photos[chat.chat_id][1] && (
                        <div
                            style={{
                                backgroundImage: `url(${
                                    photos[chat.chat_id][1]
                                })`,
                            }}
                        ></div>
                    )}
                    {photos[chat.chat_id][2] && (
                        <div
                            style={{
                                backgroundImage: `url(${
                                    photos[chat.chat_id][2]
                                })`,
                            }}
                        ></div>
                    )}
                    {photos[chat.chat_id][3] && (
                        <div
                            style={{
                                backgroundImage: `url(${
                                    photos[chat.chat_id][3]
                                })`,
                            }}
                        ></div>
                    )}
                    {photos[chat.chat_id][4] && (
                        <div
                            style={{
                                backgroundImage: `url(${
                                    photos[chat.chat_id][4]
                                })`,
                            }}
                        ></div>
                    )}
                    {photos[chat.chat_id][5] && (
                        <div
                            // className={photos[chat.chat_id][6] && "last-media"}
                            style={{
                                backgroundImage: `url(${
                                    photos[chat.chat_id][5]
                                })`,
                            }}
                        >
                            {photos[chat.chat_id][6] && (
                                <div className="overlay">
                                    <span>
                                        +{photos[chat.chat_id].length - 6}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="chat-settings">
                <div className="settings-title">
                    <div className="setting-icon"></div>
                    <span>Settings</span>
                </div>
                <div className="settings">
                    <span>Set background</span>
                    <span>Set group name</span>
                    <span>Change theme</span>
                    <span>Quick emoji</span>
                </div>
            </div>
        </div>
    );
}

export default ChatInfo;
