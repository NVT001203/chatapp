import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";
import Messenger from "../imgs/messenger.png";
import Settings from "../imgs/setting.png";
import Logout from "../imgs/logout.png";

function Navigate({ toast }) {
    const { currentUser, setCurrentUser, signOut, refreshToken } =
        useContext(AuthContext);
    const navigate = useNavigate();
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
                const data = e.response.data;
                if (data.message == "jwt expired") {
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

    return (
        <div className="navigate">
            <div className="first-item">
                <img className="logo" src={Messenger} />
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
        </div>
    );
}

export default Navigate;
