import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicInstance } from "../config/axiosConfig";
import { AuthContext } from "../contexts/authContext";
import { ChatContext } from "../contexts/chatContext";
import { StoreContext } from "../contexts/StoreContext";
import SearchIcon from "../imgs/search.png";
import Group from "../imgs/group.png";
import AddUser from "../imgs/user.png";
import RemoveUser from "../imgs/removeUser.png";
import SearchUser from "../imgs/searchUser.png";
import { socket } from "../socket/socket";

function Search({ toast }) {
    const [searched, setSearched] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [friends, setFriends] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [addUser, setAddUser] = useState(false);
    const searchRef = useRef();
    const { dispatch, store } = useContext(StoreContext);
    const { refreshToken, currentUser } = useContext(AuthContext);
    const { setCurrentChat } = useContext(ChatContext);
    const navigate = useNavigate();

    const handleKeydown = (e, action) => {
        if ((e.keyCode == 13 || action == "click") && displayName.length > 0) {
            publicInstance
                .get(`/user/search_users/${displayName}`)
                .then(({ data }) => {
                    const friendsObj = {};
                    for (const friend of data.elements) {
                        friendsObj[friend.user_id] = friend;
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
                                    friendsObj[friend.user_id] = friend;
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

    const handleAddUser = (user_id) => {
        if (!groupMembers.includes(user_id))
            setGroupMembers((pre) => [...pre, user_id]);
        else {
            setGroupMembers((pre) => pre.filter((id) => id != user_id));
        }
    };

    const handleCreateChat = async (user_id) => {
        setSearched(false);
        setDisplayName("");
        publicInstance
            .post(`/chat/create_chat`, { user_id })
            .then(({ data }) => {
                if (data.message == "Chat is exists") {
                    const messages = data.elements.messages;
                    dispatch({
                        type: "ADD_MESSAGES",
                        messages: messages,
                    });
                    return setCurrentChat(data.elements.chat);
                }
                const chatObj = { [data.elements.chat.id]: data.elements.chat };
                dispatch({
                    type: "ADD_CHATS",
                    chats: chatObj,
                });
                dispatch({
                    type: "ADD_MESSAGE",
                    message: data.elements.notice,
                });
                setCurrentChat(data.elements.chat);
                socket.emit("add-chat", {
                    chat: data.elements.chat,
                    notices: [data.elements.notice],
                    members: { [currentUser.user_id]: currentUser },
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
                            if (res.data.message == "Chat is exists") {
                                const messages = res.data.elements.messages;
                                dispatch({
                                    type: "ADD_MESSAGES",
                                    messages: messages,
                                });
                                return setCurrentChat(data.elements.chat);
                            }
                            const chatObj = {
                                [res.data.elements.chat.id]:
                                    res.data.elements.chat,
                            };
                            dispatch({
                                type: "ADD_CHATS",
                                chats: chatObj,
                            });
                            dispatch({
                                type: "ADD_MESSAGE",
                                message: data.elements.notice.notice,
                            });
                            setCurrentChat(data.elements.chat);
                            socket.emit("add-chat", {
                                chat: data.elements.chat,
                                notices: [data.elements.notice],
                                members: { [currentUser.user_id]: currentUser },
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

    const handleCreateGroup = async () => {
        setAddUser(false);
        setSearched(false);
        setDisplayName("");
        if (groupMembers.length >= 2) {
            try {
                const { data } = await publicInstance.post(
                    `/chat/create_group`,
                    {
                        members: groupMembers,
                    }
                );
                setCurrentChat(data.elements.chat);
                const chatObj = { [data.elements.chat.id]: data.elements.chat };
                let members = {};
                data.elements.chat.members.forEach((member) => {
                    members = { ...members, [member]: store.users[member] };
                });
                dispatch({
                    type: "ADD_CHATS",
                    chats: chatObj,
                });
                dispatch({
                    type: "ADD_MESSAGE",
                    message: data.elements.notice,
                });
                socket.emit("add-chat", {
                    chat: data.elements.chat,
                    notices: [data.elements.notice],
                    members: members,
                });
                setGroupMembers([]);
            } catch (e) {
                if (e.response.data.message == "jwt expired") {
                    refreshToken()
                        .then(async (d) => {
                            const { data } = await publicInstance.post(
                                `/chat/create_group`,
                                {
                                    members: groupMembers,
                                }
                            );
                            setCurrentChat(data.elements.chat);
                            const chatObj = {
                                [data.elements.chat.id]: data.elements.chat,
                            };
                            let members = {};
                            data.elements.chat.members.forEach((member) => {
                                members = {
                                    ...members,
                                    [member]: store.users[member],
                                };
                            });
                            dispatch({
                                type: "ADD_CHATS",
                                chats: chatObj,
                            });
                            dispatch({
                                type: "ADD_MESSAGE",
                                message: data.elements.notice,
                            });
                            socket.emit("add-chat", {
                                chat: data.elements.chat,
                                notices: [data.elements.notice],
                                members: members,
                            });
                            setGroupMembers([]);
                        })
                        .catch((e) => {
                            console.log(e);
                            setGroupMembers([]);
                            toast(
                                "The login session has expired! Please login again."
                            );
                            setTimeout(() => {
                                navigate("/login");
                            }, 6000);
                        });
                } else {
                    setGroupMembers([]);
                    toast("Somthing went wrong! Please try again.");
                }
            }
        } else {
            setGroupMembers([]);
            toast("Group must be equal or greater than 3 members!");
        }
    };

    return (
        <div className="search">
            <img src={SearchIcon} onClick={(e) => handleKeydown(e, "click")} />
            <input
                type="text"
                placeholder={(addUser && "Add to group...") || "Search..."}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={handleKeydown}
                ref={searchRef}
            />
            <img
                src={(addUser && SearchUser) || Group}
                className="add-group"
                onClick={() => {
                    setAddUser((pre) => !pre);
                    searchRef.current.focus();
                }}
            />
            {searched && (
                <div className={(!addUser && "friends") || "friends add-user"}>
                    <span
                        className="x-symbol"
                        onClick={() => {
                            setSearched(false);
                            setDisplayName("");
                            setGroupMembers([]);
                        }}
                    >
                        ✗
                    </span>
                    {(friends?.length > 0 &&
                        friends.map((friend) => {
                            return (
                                <div
                                    className="friend"
                                    key={friend.user_id}
                                    onClick={() => {
                                        (!addUser &&
                                            handleCreateChat(friend.user_id)) ||
                                            handleAddUser(friend.user_id);
                                    }}
                                >
                                    <div
                                        className="avatar"
                                        style={{
                                            backgroundImage: `url(${friend.avatar_url})`,
                                        }}
                                    ></div>
                                    <span
                                        className={
                                            (addUser &&
                                                "friend_name add-icon") ||
                                            "friend_name"
                                        }
                                    >
                                        {friend.display_name}
                                    </span>
                                    {addUser && (
                                        <img
                                            className="group-icon"
                                            src={
                                                (groupMembers.includes(
                                                    friend.user_id
                                                ) &&
                                                    RemoveUser) ||
                                                AddUser
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })) || (
                        <span className="not-found">User not found!</span>
                    )}
                </div>
            )}
            {addUser && searched && (
                <div className="group-action">
                    <button
                        onClick={() => setGroupMembers([])}
                        className="back"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => handleCreateGroup()}
                        className="create"
                    >
                        Create group
                    </button>
                </div>
            )}
        </div>
    );
}

export default Search;
