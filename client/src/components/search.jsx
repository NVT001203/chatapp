import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicInstance } from "../config/axiosConfig";
import { AuthContext } from "../contexts/authContext";
import { ChatContext } from "../contexts/chatContext";
import { StoreContext } from "../contexts/StoreContext";
import SearchIcon from "../imgs/search.png";

function Search({ toast }) {
    const [searched, setSearched] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [friends, setFriends] = useState([]);
    const { dispatch } = useContext(StoreContext);
    const { refreshToken } = useContext(AuthContext);
    const { setCurrentChat } = useContext(ChatContext);
    const navigate = useNavigate();

    const handleKeydown = (e, action) => {
        if ((e.keyCode == 13 || action == "click") && displayName.length > 0) {
            publicInstance
                .get(`/user/search_users/${displayName}`)
                .then(({ data }) => {
                    const friendsObj = {};
                    for (const friend of data.elements) {
                        friendsObj[friend.id] = friend;
                    }
                    dispatch({
                        type: "ADD_USERS",
                        users: friendsObj,
                    });
                    setFriends(data.elements);
                    setSearched(true);
                })
                .catch((error) => {
                    const data = error.response.data;
                    if (data.message == "jwt expired") {
                        refreshToken()
                            .then(async (data) => {
                                const res = await publicInstance.get(
                                    `/user/search_users/${displayName}`
                                );
                                setFriends(res.data.elements);
                                const friendsObj = {};
                                for (const friend of res.data.elements) {
                                    friendsObj[friend.id] = friend;
                                }
                                dispatch({
                                    type: "ADD_USERS",
                                    users: friendsObj,
                                });
                                setSearched(true);
                            })
                            .catch((e) => {
                                if (e == "Server error") {
                                    toast("Server error! Please try again.");
                                } else {
                                    toast(
                                        "The login session has expired! Please login again."
                                    );
                                    setTimeout(() => {
                                        navigate("/login");
                                    }, 6000);
                                }
                            });
                    } else {
                        return toast("Something went wrong! Please try again.");
                    }
                });
        } else if (
            (e.keyCode == 13 || action == "click") &&
            displayName.length == 0
        )
            setSearched(false);
    };

    const handleCreateChat = async (user_id) => {
        setSearched(false);
        setDisplayName("");
        publicInstance
            .post(`/chat/create_chat`, { user_id })
            .then(({ data }) => {
                console.log(data);
                if (data.message == "Chat is exists") {
                    return setCurrentChat({
                        id: data.elements.id,
                        chat_avatar: data.elements.chat_avatar,
                        name: data.elements.name,
                    });
                }
                const chatObj = { [data.elements.id]: data.elements };
                dispatch({
                    type: "ADD_CHATS",
                    chats: chatObj,
                });
                setCurrentChat({
                    id: data.elements.id,
                    chat_avatar: data.elements.chat_avatar,
                    name: data.elements.name,
                });
            })
            .catch((error) => {
                const data = error.response.data;
                if (data.message == "jwt expired") {
                    refreshToken()
                        .then(async (data) => {
                            const res = await publicInstance.get(
                                `/user/search_users/${displayName}`
                            );
                            if (res.data.message == "Chat is exists")
                                return setCurrentChat({
                                    id: data.elements.id,
                                    chat_avatar: data.elements.chat_avatar,
                                    name: data.elements.name,
                                });

                            const chatObj = {
                                [res.data.elements.id]: res.data.elements,
                            };
                            dispatch({
                                type: "ADD_CHATS",
                                chats: chatObj,
                            });
                            setCurrentChat({
                                id: data.elements.id,
                                chat_avatar: data.elements.chat_avatar,
                                name: data.elements.name,
                            });
                        })
                        .catch((e) => {
                            if (e == "Server error") {
                                toast("Server error! Please try again.");
                            } else {
                                toast(
                                    "The login session has expired! Please login again."
                                );
                                setTimeout(() => {
                                    navigate("/login");
                                }, 6000);
                            }
                        });
                } else {
                    return toast("Something went wrong! Please try again.");
                }
            });
    };

    return (
        <div className="search">
            <img src={SearchIcon} onClick={(e) => handleKeydown(e, "click")} />
            <input
                type="text"
                placeholder="Search..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={handleKeydown}
            />
            {searched && (
                <div className="friends" onBlur={() => setSearched(false)}>
                    <span
                        className="x-symbol"
                        onClick={() => {
                            setSearched(false);
                            setDisplayName("");
                        }}
                    >
                        ✗
                    </span>
                    {(friends?.length > 0 &&
                        friends.map((friend) => {
                            return (
                                <div
                                    className="friend"
                                    key={friend.id}
                                    onClick={() => {
                                        handleCreateChat(friend.id);
                                    }}
                                >
                                    <div
                                        className="avatar"
                                        style={{
                                            backgroundImage: `url(${friend.avatar_url})`,
                                        }}
                                    ></div>
                                    <span className="friend_name">
                                        {friend.display_name}
                                    </span>
                                </div>
                            );
                        })) || (
                        <span className="not-found">User not found!</span>
                    )}
                </div>
            )}
        </div>
    );
}

export default Search;
