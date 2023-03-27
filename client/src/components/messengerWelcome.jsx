import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import Welcome from "../imgs/welcome.jpeg";

function MessengerWelcome() {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="hello">
            <img src={Welcome} />
            <div>
                <h3>Welcome, {currentUser?.display_name}!</h3>
                <h4>Please select a chat to Start Messaging.</h4>
            </div>
        </div>
    );
}

export default MessengerWelcome;
