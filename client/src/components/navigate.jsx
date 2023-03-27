import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

function Navigate({ toast }) {
    const { currentUser, setCurrentUser, signOut } = useContext(AuthContext);
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
                toast("Somthing went wrong! Please try again.");
            });
    };

    return (
        <div className="navigate">
            <div className="first-item">
                <div className="icon tabs"></div>
                <div className="navigate-item">
                    <div className="icon category"></div>
                    <div className="icon messenger"></div>
                    <div className="icon friends"></div>
                </div>
            </div>
            <div className="second-item">
                <div className="setting">
                    <div className="icon notification"></div>
                    <div className="icon setting"></div>
                    <div
                        onClick={() => logout()}
                        className="icon log-out"
                    ></div>
                </div>
                <div className="user-account">
                    <img src={currentUser?.avatar_url} />
                </div>
            </div>
        </div>
    );
}

export default Navigate;
