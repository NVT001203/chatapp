import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";
import Messenger from "../imgs/messenger.png";
import Settings from "../imgs/setting.png";
import Logout from "../imgs/logout.png";
import Friends from "../imgs/friends.png";
import { publicInstance } from "../config/axiosConfig";

function Navigate({ data }) {
    const { toast, store, dispatch } = data;
    const { currentUser, setCurrentUser, signOut, refreshToken } =
        useContext(AuthContext);
    const navigate = useNavigate();
    const [showFriends, setShowFriends] = useState(false);
    const [tabActive, setTabActive] = useState(1);
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
        if (store.friends && Object.keys(store.friends).length > 0) {
            return;
        } else {
            try {
                const { data } = await publicInstance.get(
                    `user/${currentUser.user_id}/get_friends`
                );
                const { friends } = data.elements;
                const friendsObj = {};
                friends.forEach((friend) => {
                    friendsObj[friend.user_id] = friend;
                });
                dispatch({
                    type: "ADD_FRIENDS",
                    user_id: currentUser.user_id,
                    friends: friendsObj,
                });
                dispatch({
                    type: "ADD_USER",
                    users: friendsObj,
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
                            const { friends } = data.elements;
                            const friendsObj = {};
                            friends.forEach((friend) => {
                                friendsObj[friend.user_id] = friend;
                            });
                            dispatch({
                                type: "ADD_FRIENDS",
                                user_id: currentUser.user_id,
                                friends: friendsObj,
                            });
                            dispatch({
                                type: "ADD_USER",
                                users: friendsObj,
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
        }
    };

    return (
        <div className="navigate">
            <div className="first-item">
                <img className="logo" src={Messenger} />
                <img
                    className="friends-icon"
                    onClick={() => getFriends()}
                    src={Friends}
                />
            </div>
            <div className="second-item">
                <div className="setting">
                    <img src={Settings} className="icon" />
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
                    <div className="friends-title">
                        <span
                            className={tabActive == 1 ? "active" : ""}
                            onClick={() => setTabActive(1)}
                        >
                            Friends
                        </span>
                        <span
                            className={tabActive == 2 ? "active" : ""}
                            onClick={() => setTabActive(2)}
                        >
                            Search friend
                        </span>
                    </div>
                    <div className="friends-content">
                        {store.friends &&
                            store.friends[currentUser.user_id] &&
                            Object.entries(store.friends[currentUser.user_id])
                                .filter(
                                    ([id, friend]) => id != currentUser.user_id
                                )
                                .map(([id, friend]) => {
                                    return (
                                        <div key={id} className="friend-item">
                                            {friend.display_name}
                                        </div>
                                    );
                                })}
                    </div>
                    <span
                        className="x-symbol"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFriends(false);
                        }}
                    >
                        ✗
                    </span>
                </div>
            )}
        </div>
    );
}

export default Navigate;
