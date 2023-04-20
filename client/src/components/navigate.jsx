import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";
import Messenger from "../imgs/messenger.png";
import Settings from "../imgs/setting.png";
import Logout from "../imgs/logout.png";
import Friends from "../imgs/friends.png";
import AddUser from "../imgs/user.png";
import Hide from "../imgs/hide.png";
import View from "../imgs/view.png";
import Contacts from "../imgs/contacts.png";
import { v4 as uuidv4 } from "uuid";
import { socket } from "../socket/socket";

import { publicInstance } from "../config/axiosConfig";
import { StoreContext } from "../contexts/StoreContext";
import { storage } from "../config/firebase/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

function Navigate({ data }) {
    const { toast, newRequest, setNewRequest } = data;
    const { store, dispatch, sortFriends } = useContext(StoreContext);
    const { currentUser, setCurrentUser, signOut, refreshToken } =
        useContext(AuthContext);
    const navigate = useNavigate();
    const [showFriends, setShowFriends] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showInputName, setShowInputName] = useState(false);
    const [showInputEmail, setShowInputEmail] = useState(false);
    const [inputEmail, setInputEmail] = useState("");
    const [inputName, setInputName] = useState("");
    const [tabActive, setTabActive] = useState(1);
    const [inputSearchUser, setInputSearchUser] = useState("");
    const [friends, setFriends] = useState({});
    const [showConfirm, setShowConfirm] = useState({ toggle: false });
    const [showConfirmSettings, setShowConfirmSettings] = useState({
        toggle: false,
    });
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [inputPassword, setInputPassword] = useState("");
    const [inputPasswordChange, setInputPasswordChange] = useState("");
    const [inputPasswordConfirm, setInputPasswordConfirm] = useState("");
    const [showContacts, setShowContacts] = useState(false);
    const [currentTab, setCurrentTab] = useState(1);

    const logout = async () => {
        await signOut()
            .then((status) => {
                if (status) {
                    setCurrentUser({});
                    navigate("/login");
                } else {
                    toast("Somthing went wrong! Please try again.");
                }
            })
            .catch((e) => {
                const data = e.response?.data;
                if (data?.message == "jwt expired") {
                    refreshToken()
                        .then(async (res) => {
                            await signOut()
                                .then((status) => {
                                    if (status) {
                                        setCurrentUser({});
                                        navigate("/login");
                                    } else {
                                        toast(
                                            "Somthing went wrong! Please try again."
                                        );
                                    }
                                })
                                .catch((e) => {
                                    navigate("/login");
                                    setCurrentUser({});
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
                }
                toast("Somthing went wrong! Please try again.");
            });
    };

    const getFriends = async () => {
        if (newRequest) setNewRequest(false);
        if (store.friends && store.friends[currentUser.user_id]) {
            return setShowFriends(true);
        }
        try {
            const { data } = await publicInstance.get(
                `user/${currentUser.user_id}/get_friends`
            );
            const { friends, friends_info } = data.elements;
            const friendsObj = {};
            const friendInfoObj = {};
            friends_info.forEach((friend, index) => {
                friendInfoObj[friend.user_id] = friend;
            });
            friends.map((friend, index) => {
                if (friend.user_id == currentUser.user_id) {
                    friendsObj[friend.friend_id] = {
                        friend_id: friend.friend_id,
                        status: friend.status,
                    };
                } else {
                    friendsObj[friend.user_id] = {
                        friend_id: friend.user_id,
                        status:
                            friend.status == "request"
                                ? "requested"
                                : friend.status,
                    };
                }
            });
            dispatch({
                type: "ADD_FRIENDS",
                user_id: currentUser.user_id,
                friends: friendsObj,
            });
            dispatch({
                type: "ADD_USERS",
                users: friendInfoObj,
            });
            setShowFriends(true);
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.get(
                            `user/${currentUser.user_id}/get_friends`
                        );
                        const { friends, friends_info } = data.elements;
                        const friendsObj = {};
                        const friendInfoObj = {};
                        friends_info.forEach((friend, index) => {
                            friendInfoObj[friend.user_id] = friend;
                        });
                        friends.map((friend, index) => {
                            if (friend.user_id == currentUser.user_id) {
                                friendsObj[friend.friend_id] = {
                                    friend_id: friend.friend_id,
                                    status: friend.status,
                                };
                            } else {
                                friendsObj[friend.user_id] = {
                                    friend_id: friend.user_id,
                                    status:
                                        friend.status == "request"
                                            ? "requested"
                                            : friend.status,
                                };
                            }
                        });
                        dispatch({
                            type: "ADD_FRIENDS",
                            user_id: currentUser.user_id,
                            friends: friendsObj,
                        });
                        dispatch({
                            type: "ADD_USERS",
                            users: friendInfoObj,
                        });
                        setShowFriends(true);
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
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
                toast("Server error! Please try again.");
            }
        }
    };

    const hanldeSearchUser = async (e) => {
        if (e.keyCode == 13 && inputSearchUser.length > 0) {
            publicInstance
                .get(`/user/search_users/${inputSearchUser}`)
                .then(({ data }) => {
                    const friendsObj = {};
                    for (const friend of data.elements) {
                        friendsObj[friend.user_id] = friend;
                    }
                    dispatch({
                        type: "ADD_USERS",
                        users: friendsObj,
                    });
                    setFriends(friendsObj);
                })
                .catch((error) => {
                    const data = error.response.data;
                    if (data.message == "jwt expired") {
                        refreshToken()
                            .then(async (data) => {
                                const res = await publicInstance.get(
                                    `/user/search_users/${inputSearchUser}`
                                );
                                const friendsObj = {};
                                for (const friend of res.data.elements) {
                                    friendsObj[friend.user_id] = friend;
                                }
                                dispatch({
                                    type: "ADD_USERS",
                                    users: friendsObj,
                                });
                                setFriends(friendsObj);
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
        }
    };

    const handleAddFriend = async (user) => {
        try {
            const { data } = await publicInstance.post(
                `user/${currentUser.user_id}/add_friend`,
                {
                    friend_id: user.user_id,
                }
            );
            const { friend } = data.elements;
            dispatch({
                type: "ADD_FRIENDS",
                user_id: friend.user_id,
                friends: {
                    [friend.friend_id]: {
                        friend_id: friend.friend_id,
                        status: "request",
                    },
                },
            });
            socket.emit("add-friend", { friend, user: currentUser });
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.post(
                            `user/${currentUser.user_id}/add_friend`,
                            {
                                friend_id: user.user_id,
                            }
                        );
                        const { friend } = data.elements;
                        dispatch({
                            type: "ADD_FRIENDS",
                            user_id: friend.user_id,
                            friends: {
                                [friend.friend_id]: {
                                    friend_id: friend.friend_id,
                                    status: "request",
                                },
                            },
                        });
                        socket.emit("add-friend", {
                            friend,
                            user: currentUser,
                        });
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
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
                toast("Server error! Please try again.");
            }
        }
    };

    const handleUnsent = async (id) => {
        try {
            const { data } = await publicInstance.delete(`user/${id}/delete`);
            const { friend } = data.elements;
            dispatch({
                type: "REMOVE_FRIEND",
                user_id:
                    friend.friend_id != currentUser.user_id
                        ? friend.user_id
                        : friend.friend_id,
                friend_id:
                    friend.friend_id == currentUser.user_id
                        ? friend.user_id
                        : friend.friend_id,
            });
            dispatch({
                type: "FRIEND_OFF",
                user_id: currentUser.user_id,
                friend_off:
                    friend.friend_id == currentUser.user_id
                        ? friend.user_id
                        : friend.friend_id,
            });
            socket.emit("delete-friend", { friend, user: currentUser });
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.delete(
                            `user/${id}/delete`
                        );
                        const { friend } = data.elements;
                        dispatch({
                            type: "REMOVE_FRIEND",
                            user_id:
                                friend.friend_id != currentUser.user_id
                                    ? friend.user_id
                                    : friend.friend_id,
                            friend_id:
                                friend.friend_id == currentUser.user_id
                                    ? friend.user_id
                                    : friend.friend_id,
                        });
                        dispatch({
                            type: "FRIEND_OFF",
                            user_id: currentUser.user_id,
                            friend_off:
                                friend.friend_id == currentUser.user_id
                                    ? friend.user_id
                                    : friend.friend_id,
                        });
                        socket.emit("delete-friend", {
                            friend,
                            user: currentUser,
                        });
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
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
                toast("Server error! Please try again.");
            }
        }
    };

    const handleAccept = async (id) => {
        try {
            const { data } = await publicInstance.put(`user/${id}/accept`);
            const { friend } = data.elements;
            dispatch({
                type: "ADD_FRIENDS",
                user_id: currentUser.user_id,
                friends: {
                    [friend.user_id]: {
                        friend_id: friend.friend_id,
                        status: "accept",
                    },
                },
            });
            socket.emit("accept-friend", { friend, user: currentUser });
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.put(
                            `user/${id}/accept`
                        );
                        const { friend } = data.elements;
                        dispatch({
                            type: "ADD_FRIENDS",
                            user_id: currentUser.user_id,
                            friends: {
                                [friend.user_id]: {
                                    friend_id: friend.friend_id,
                                    status: "accept",
                                },
                            },
                        });
                        socket.emit("accept-friend", {
                            friend,
                            user: currentUser,
                        });
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
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
                toast("Server error! Please try again.");
            }
        }
    };

    const handleGetPrivateInfo = async () => {
        if (currentUser.email) return setShowSettings(true);
        try {
            const { data } = await publicInstance.get(
                `user/get_privateInfo/${currentUser.user_id}`
            );
            setCurrentUser((pre) => {
                return {
                    ...pre,
                    ...data.elements,
                };
            });
            setShowSettings(true);
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.get(
                            `user/get_privateInfo/${currentUser.user_id}`
                        );
                        setCurrentUser((pre) => {
                            return {
                                ...pre,
                                ...data.elements,
                            };
                        });
                        setShowSettings(true);
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
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
                toast("Server error! Please try again.");
            }
        }
    };

    const handleChangeContact = async () => {
        const re =
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (!inputEmail.match(re)) return toast("Email invalid!");

        try {
            const { data } = await publicInstance.put(
                `user/update_email/${currentUser.user_id}`,
                { new_email: inputEmail }
            );
            if (data.status != "success")
                return toast("Your account cannot update email!");
            setCurrentUser((pre) => {
                return {
                    ...pre,
                    ...data.elements,
                };
            });
            toast("Email updated!");
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.put(
                            `user/update_email/${currentUser.user_id}`,
                            { new_email: inputEmail }
                        );
                        if (data.status != "success")
                            return toast("Your account cannot update email!");
                        setCurrentUser((pre) => {
                            return {
                                ...pre,
                                ...data.elements,
                            };
                        });
                        toast("Email updated!");
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
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
                toast("Server error! Please try again.");
            }
        }
    };

    const handleChangeDisplayName = async (e, name, avatar_url) => {
        if (e.keyCode == 13) {
            try {
                const { data } = await publicInstance.put(
                    `user/update_publicInfo/${currentUser.user_id}`,
                    {
                        display_name: name,
                        avatar_url: avatar_url,
                    }
                );
                setCurrentUser((pre) => {
                    return {
                        ...pre,
                        ...data.elements,
                    };
                });
                dispatch({
                    type: "ADD_USERS",
                    users: {
                        [currentUser.user_id]: {
                            user_id: currentUser.user_id,
                            display_name: currentUser.display_name,
                            avatar_url: currentUser.avatar_url,
                        },
                    },
                });
                toast("Display name updated!");
            } catch (e) {
                const data = e.response?.data;
                if (data?.message == "jwt expired") {
                    refreshToken()
                        .then(async (res) => {
                            const { data } = await publicInstance.put(
                                `user/update_publicInfo/${currentUser.user_id}`,
                                {
                                    display_name: name,
                                    avatar_url: avatar_url,
                                }
                            );
                            setCurrentUser((pre) => {
                                return {
                                    ...pre,
                                    ...data.elements,
                                };
                            });
                            dispatch({
                                type: "ADD_USERS",
                                users: {
                                    [currentUser.user_id]: {
                                        user_id: currentUser.user_id,
                                        display_name: currentUser.display_name,
                                        avatar_url: currentUser.avatar_url,
                                    },
                                },
                            });
                            toast("Display name updated!");
                        })
                        .catch((e) => {
                            if (e == "Server error") {
                                return toast("Server error! Please try again.");
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
                    toast("Server error! Please try again.");
                }
            }
        }
    };

    const handleChangeAvatar = async (e, name) => {
        try {
            const id = uuidv4();
            const file = e.target.files[0];
            const storageRef = ref(storage, id);
            const uploadTask = await uploadBytesResumable(storageRef, file);
            const photo_url = await getDownloadURL(storageRef);
            const { data } = await publicInstance.put(
                `user/update_publicInfo/${currentUser.user_id}`,
                {
                    display_name: name,
                    avatar_url: photo_url,
                }
            );
            setCurrentUser((pre) => {
                return {
                    ...pre,
                    ...data.elements,
                };
            });
            dispatch({
                type: "ADD_USERS",
                users: {
                    [currentUser.user_id]: {
                        user_id: currentUser.user_id,
                        display_name: currentUser.display_name,
                        avatar_url: currentUser.avatar_url,
                    },
                },
            });
            toast("Avatar updated!");
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const id = uuidv4();
                        const file = e.target.files[0];
                        const storageRef = ref(storage, id);
                        const uploadTask = await uploadBytesResumable(
                            storageRef,
                            file
                        );
                        const photo_url = await getDownloadURL(storageRef);
                        const { data } = await publicInstance.put(
                            `user/update_publicInfo/${currentUser.user_id}`,
                            {
                                display_name: name,
                                avatar_url: photo_url,
                            }
                        );
                        setCurrentUser((pre) => {
                            return {
                                ...pre,
                                ...data.elements,
                            };
                        });
                        dispatch({
                            type: "ADD_USERS",
                            users: {
                                [currentUser.user_id]: {
                                    user_id: currentUser.user_id,
                                    display_name: currentUser.display_name,
                                    avatar_url: currentUser.avatar_url,
                                },
                            },
                        });
                        toast("Avatar updated!");
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
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
                toast("Server error! Please try again.");
            }
        }
    };

    const handleValidatePassword = () => {
        if (!inputPassword) return toast("Password is required!");
        else if (inputPassword.length < 3 || inputPassword.length > 8)
            return toast("Password must be between in 3 and 8 letter!");
        else if (!inputPasswordChange)
            return toast("Please enter new password!");
        else if (
            inputPasswordChange.length < 3 ||
            inputPasswordChange.length > 8
        )
            return toast("New password must be between in 3 and 8 letter!");
        else if (!inputPasswordConfirm)
            return toast("Password confirm is required!");
        else if (inputPasswordChange != inputPasswordConfirm)
            return toast("New password and password confirm are not same!");
        else if (inputPassword == inputPasswordChange)
            return toast("Password and new password is same!");
        else {
            setShowConfirmSettings({ toggle: true, action: "password" });
        }
    };

    const handleChangePassword = async () => {
        try {
            const { data } = await publicInstance.put(
                `user/update_password/${currentUser.user_id}`,
                {
                    password: inputPassword,
                    new_password: inputPasswordChange,
                }
            );
            toast("Password updated!");
            setShowConfirmSettings(false);
            setInputPassword("");
            setInputPasswordChange("");
            setInputPasswordConfirm("");
            setShowEditPassword(false);
        } catch (e) {
            const data = e.response?.data;
            if (data?.message == "jwt expired") {
                refreshToken()
                    .then(async (res) => {
                        const { data } = await publicInstance.put(
                            `user/update_password/${currentUser.user_id}`,
                            {
                                password: inputPassword,
                                new_password: inputPasswordChange,
                            }
                        );
                        toast("Password updated!");
                        setShowConfirmSettings(false);
                        setInputPassword("");
                        setInputPasswordChange("");
                        setInputPasswordConfirm("");
                        setShowEditPassword(false);
                    })
                    .catch((e) => {
                        if (e == "Server error") {
                            return toast("Server error! Please try again.");
                        } else if (data.message == "Password is incorrect") {
                            setShowConfirmSettings(false);
                            toast(data.message);
                        } else {
                            toast(
                                "The login session has expired! Please login again."
                            );
                            setTimeout(() => {
                                navigate("/login");
                            }, 6000);
                        }
                    });
            } else if (data.message == "Password is incorrect") {
                setShowConfirmSettings(false);
                toast(data.message);
            } else {
                toast("Server error! Please try again.");
            }
        }
    };

    return (
        <div className="navigate">
            <div className="first-item">
                <img
                    className="logo"
                    src={Messenger}
                    id={currentTab == 1 ? "target" : ""}
                />
                <img
                    className="contacts-icon"
                    onClick={() => {
                        setCurrentTab(2);
                        setShowContacts(true);
                    }}
                    src={Contacts}
                    id={currentTab == 2 ? "target" : ""}
                />
                <img
                    className="friends-icon"
                    onClick={() => {
                        setCurrentTab(3);
                        getFriends();
                    }}
                    src={Friends}
                    id={currentTab == 3 ? "target" : ""}
                />
                {newRequest && <span className="new-request"></span>}
            </div>
            <div className="second-item">
                <div className="setting">
                    <img
                        src={Settings}
                        onClick={() => handleGetPrivateInfo()}
                        className="icon"
                    />
                    <img
                        src={Logout}
                        onClick={() => logout()}
                        className="icon"
                    />
                </div>
                <div className="user-account">
                    <img src={currentUser?.avatar_url} />
                </div>
            </div>
            {showFriends && (
                <div className="friends">
                    <div className="container">
                        <div className="friends-title">
                            <span
                                className={
                                    tabActive == 1
                                        ? "active title-item"
                                        : "title-item"
                                }
                                onClick={() => setTabActive(1)}
                            >
                                Friends
                            </span>
                            <span
                                className={
                                    tabActive == 2
                                        ? "active title-item"
                                        : "title-item"
                                }
                                onClick={() => setTabActive(2)}
                            >
                                Search friend
                            </span>
                        </div>
                        <div className="friends-content">
                            {store.friends &&
                                store.friends[currentUser.user_id] &&
                                tabActive == 1 &&
                                sortFriends(store.friends[currentUser.user_id])
                                    .filter(
                                        (id) =>
                                            store.friends[currentUser.user_id][
                                                id
                                            ].status != "accept"
                                    )
                                    .map((id) => {
                                        return (
                                            <div
                                                className="member"
                                                key={id}
                                                id={
                                                    store.friends[
                                                        currentUser.user_id
                                                    ][id].status
                                                }
                                            >
                                                <div className="info-wrapper">
                                                    <div
                                                        className="avatar"
                                                        style={{
                                                            backgroundImage: `url(${store.users[id].avatar_url})`,
                                                        }}
                                                    ></div>
                                                    <span
                                                        className={
                                                            "member_name"
                                                        }
                                                    >
                                                        {
                                                            store.users[id]
                                                                .display_name
                                                        }
                                                    </span>
                                                </div>
                                                {store.friends[
                                                    currentUser.user_id
                                                ][id].status == "request" && (
                                                    <div className="status">
                                                        <span className="request">
                                                            Was sent request
                                                        </span>
                                                        <span
                                                            className="action unsent"
                                                            onClick={() =>
                                                                handleUnsent(id)
                                                            }
                                                        >
                                                            Unsent
                                                        </span>
                                                    </div>
                                                )}

                                                {store.friends[
                                                    currentUser.user_id
                                                ][id].status == "requested" && (
                                                    <div className="status">
                                                        <span
                                                            onClick={() =>
                                                                handleAccept(id)
                                                            }
                                                            className="action accept"
                                                        >
                                                            Accept
                                                        </span>
                                                        <span
                                                            onClick={() =>
                                                                handleUnsent(id)
                                                            }
                                                            className="action refuse"
                                                        >
                                                            Delete
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            {tabActive == 2 && (
                                <div className="search-friend">
                                    <input
                                        placeholder="Search friend..."
                                        onKeyDown={hanldeSearchUser}
                                        onClick={(e) => e.stopPropagation()}
                                        value={inputSearchUser}
                                        onChange={(e) =>
                                            setInputSearchUser(e.target.value)
                                        }
                                    />
                                    {friends &&
                                        Object.keys(friends).length > 0 &&
                                        Object.entries(friends).map(
                                            ([id, friend]) => {
                                                return (
                                                    <div
                                                        className="member"
                                                        key={id}
                                                    >
                                                        <div className="info-wrapper">
                                                            <div
                                                                className="avatar"
                                                                style={{
                                                                    backgroundImage: `url(${friend.avatar_url})`,
                                                                }}
                                                            ></div>
                                                            <span
                                                                className={
                                                                    "member_name"
                                                                }
                                                            >
                                                                {
                                                                    friend.display_name
                                                                }
                                                            </span>
                                                        </div>
                                                        <></>
                                                        {(store.friends &&
                                                            store.friends[
                                                                currentUser
                                                                    .user_id
                                                            ] &&
                                                            !Object.keys(
                                                                store.friends[
                                                                    currentUser
                                                                        .user_id
                                                                ]
                                                            ).includes(id) && (
                                                                <img
                                                                    src={
                                                                        AddUser
                                                                    }
                                                                    className="add-friend"
                                                                    onClick={() =>
                                                                        handleAddFriend(
                                                                            friend
                                                                        )
                                                                    }
                                                                />
                                                            )) || (
                                                            <>
                                                                {store.friends[
                                                                    currentUser
                                                                        .user_id
                                                                ][id].status ==
                                                                    "request" && (
                                                                    <div className="status">
                                                                        <span className="request">
                                                                            Was
                                                                            sent
                                                                            request
                                                                        </span>
                                                                        <span className="action unsent">
                                                                            Unsent
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {store.friends[
                                                                    currentUser
                                                                        .user_id
                                                                ][id].status ==
                                                                    "requested" && (
                                                                    <div className="status">
                                                                        <span className="action accept">
                                                                            Accept
                                                                        </span>
                                                                        <span className="action refuse">
                                                                            Delete
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                    <span
                        className="x-symbol"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFriends(false);
                            setFriends({});
                            setInputSearchUser("");
                        }}
                    >
                        ✗
                    </span>
                </div>
            )}
            {showSettings && (
                <div className="settings">
                    <div className="wrapper">
                        <div className="account">
                            <img src={currentUser.avatar_url} />
                            <span className="user_name">
                                {currentUser.display_name}
                            </span>
                        </div>
                        <h2 className="title">General Account Settings</h2>
                        <div className="content">
                            <div className="content-item">
                                <span className="setting">Name</span>
                                {!showInputName && (
                                    <span
                                        className="detail"
                                        onDoubleClick={() => {
                                            setInputName(
                                                currentUser.display_name
                                            );
                                            setShowInputName(true);
                                        }}
                                    >
                                        {currentUser.display_name}
                                    </span>
                                )}
                                {showInputName && (
                                    <input
                                        value={inputName}
                                        onChange={(e) =>
                                            setInputName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            handleChangeDisplayName(
                                                e,
                                                inputName,
                                                currentUser.avatar_url
                                            )
                                        }
                                        onBlur={() => setShowInputName(false)}
                                        className="detail"
                                        type="text"
                                    ></input>
                                )}
                            </div>
                            <div className="content-item">
                                <span className="setting">Avatar</span>
                                <label htmlFor="file" className="detail">
                                    {currentUser.avatar_url}
                                </label>
                                <input
                                    type="file"
                                    style={{ display: "none" }}
                                    accept="image/png, image/jpeg"
                                    id="file"
                                    name="file"
                                    onChange={(e) => {
                                        handleChangeAvatar(
                                            e,
                                            currentUser.display_name
                                        );
                                    }}
                                />
                            </div>
                            <div className="content-item">
                                <span className="setting">Contact</span>
                                {!showInputEmail && (
                                    <span
                                        className="detail"
                                        onDoubleClick={() => {
                                            setInputEmail(currentUser.email);
                                            setShowInputEmail(true);
                                        }}
                                    >
                                        {currentUser.email}
                                    </span>
                                )}
                                {showInputEmail && (
                                    <input
                                        value={inputEmail}
                                        onChange={(e) =>
                                            setInputEmail(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.keyCode == 13 &&
                                            setShowConfirmSettings({
                                                toggle: true,
                                                action: "email",
                                            })
                                        }
                                        onBlur={() => setShowInputEmail(false)}
                                        className="detail"
                                        type="email"
                                    ></input>
                                )}
                            </div>
                            {
                                <div className="content-item">
                                    <span className="setting">Password</span>
                                    <span className="detail">
                                        ********
                                        <button
                                            onClick={(e) => {
                                                setShowEditPassword(true);
                                            }}
                                            className="change-password"
                                        >
                                            Edit
                                        </button>
                                    </span>
                                </div>
                            }
                        </div>
                    </div>
                    <span
                        className="x-symbol"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSettings(false);
                        }}
                    >
                        ✗
                    </span>
                    {showEditPassword && (
                        <div className="password-edit">
                            <div className="edit-wrapper">
                                <span className="title">Change password</span>
                                <div className="content">
                                    <div className="content-item password">
                                        <input
                                            placeholder="Enter your password..."
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={inputPassword}
                                            onChange={(e) =>
                                                setInputPassword(e.target.value)
                                            }
                                        />
                                        <img
                                            src={showPassword ? View : Hide}
                                            className="hide-view_password"
                                            onClick={() =>
                                                setShowPassword((pre) => !pre)
                                            }
                                        />
                                    </div>
                                    <div className="content-item password-change">
                                        <input
                                            placeholder="Enter new password..."
                                            type={
                                                showPasswordChange
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={inputPasswordChange}
                                            onChange={(e) =>
                                                setInputPasswordChange(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <img
                                            src={
                                                showPasswordChange ? View : Hide
                                            }
                                            className="hide-view_password"
                                            onClick={() =>
                                                setShowPasswordChange(
                                                    (pre) => !pre
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="content-item password-confirm">
                                        <input
                                            placeholder="Confirm new password..."
                                            type={
                                                showPasswordConfirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={inputPasswordConfirm}
                                            onChange={(e) =>
                                                setInputPasswordConfirm(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <img
                                            src={
                                                showPasswordConfirm
                                                    ? View
                                                    : Hide
                                            }
                                            className="hide-view_password"
                                            onClick={() =>
                                                setShowPasswordConfirm(
                                                    (pre) => !pre
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <button
                                    className="change-btn"
                                    onClick={() => handleValidatePassword()}
                                >
                                    Change
                                </button>
                            </div>
                            <span
                                className="x-symbol"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInputPassword("");
                                    setInputPasswordChange("");
                                    setInputPasswordConfirm("");
                                    setShowEditPassword(false);
                                }}
                            >
                                ✗
                            </span>
                        </div>
                    )}
                    {showConfirmSettings.toggle && (
                        <div className="confirm-delete">
                            <div className="confirm-wrapper">
                                <span className="title">
                                    Are you sure you want to change?
                                </span>
                                <div className="content">
                                    <span
                                        className="item first"
                                        onClick={(e) => {
                                            showConfirmSettings.action ==
                                                "email" &&
                                                handleChangeContact();
                                            showConfirmSettings.action ==
                                                "password" &&
                                                handleChangePassword();
                                            setShowConfirmSettings({
                                                toggle: false,
                                            });
                                        }}
                                    >
                                        Yes
                                    </span>
                                    <span
                                        className="item second"
                                        onClick={() =>
                                            setShowConfirmSettings({
                                                toggle: false,
                                            })
                                        }
                                    >
                                        No
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {currentTab == 2 && showContacts && (
                <div className="friends">
                    <div className="container">
                        <div className="friends-title">
                            <span
                                className={
                                    tabActive == 1
                                        ? "active title-item"
                                        : "title-item"
                                }
                                onClick={() => setTabActive(1)}
                            >
                                Contacts friends
                            </span>
                        </div>
                        <div className="friends-content">
                            {store.friends &&
                                store.friends[currentUser.user_id] &&
                                tabActive == 1 &&
                                ((sortFriends(
                                    store.friends[currentUser.user_id]
                                ).filter(
                                    (id) =>
                                        store.friends[currentUser.user_id][id]
                                            .status == "accept"
                                ).length < 1 && (
                                    <span className="not-contacts">
                                        You are not contacts
                                    </span>
                                )) ||
                                    sortFriends(
                                        store.friends[currentUser.user_id]
                                    )
                                        .filter(
                                            (id) =>
                                                store.friends[
                                                    currentUser.user_id
                                                ][id].status == "accept"
                                        )
                                        .map((id) => {
                                            return (
                                                <div
                                                    className={
                                                        store.friends_online &&
                                                        store.friends_online[
                                                            currentUser.user_id
                                                        ]?.includes(id)
                                                            ? "member online-label"
                                                            : "member"
                                                    }
                                                    key={id}
                                                    id={
                                                        store.friends[
                                                            currentUser.user_id
                                                        ][id].status
                                                    }
                                                >
                                                    <div className="info-wrapper">
                                                        <div
                                                            className="avatar"
                                                            style={{
                                                                backgroundImage: `url(${store.users[id].avatar_url})`,
                                                            }}
                                                        ></div>
                                                        <span
                                                            className={
                                                                "member_name"
                                                            }
                                                        >
                                                            {
                                                                store.users[id]
                                                                    .display_name
                                                            }
                                                        </span>
                                                    </div>
                                                    {store.friends[
                                                        currentUser.user_id
                                                    ][id].status ==
                                                        "accept" && (
                                                        <div className="status">
                                                            <span
                                                                className="action unsent"
                                                                onClick={() => {
                                                                    setShowConfirm(
                                                                        {
                                                                            toggle: true,
                                                                            id,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                Delete
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }))}
                        </div>
                    </div>

                    <span
                        className="x-symbol"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowContacts(false);
                        }}
                    >
                        ✗
                    </span>
                    {showConfirm.toggle && (
                        <div className="confirm-delete">
                            <div className="confirm-wrapper">
                                <span className="title">
                                    Are you sure you want to delete?
                                </span>
                                <div className="content">
                                    <span
                                        className="item first"
                                        onClick={() => {
                                            handleUnsent(showConfirm.id);
                                            setShowConfirm({ toggle: false });
                                        }}
                                    >
                                        Yes
                                    </span>
                                    <span
                                        className="item second"
                                        onClick={() =>
                                            setShowConfirm({ toggle: false })
                                        }
                                    >
                                        No
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Navigate;
