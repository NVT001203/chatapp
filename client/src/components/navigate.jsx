import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";

function Navigate() {
    const { currentUser } = useContext(AuthContext);
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
                </div>
                <div className="user-account">
                    <img src={currentUser.avatar_url} />
                </div>
            </div>
        </div>
    );
}

export default Navigate;
