import { loginGoogle, loginFacebook, loginRoute } from "../config/apiRoute";
import Google from "../imgs/google.png";
import Facebook from "../imgs/facebook.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../imgs/Loading.gif";
import { AuthContext } from "../contexts/authContext";
import { publicInstance, authInstance } from "../config/axiosConfig";
import { StoreContext } from "../contexts/StoreContext";

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const { setCurrentUser } = useContext(AuthContext);
    const { dispatch } = useContext(StoreContext);
    const navigate = useNavigate();

    const notify = (message) => {
        return toast(message);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;
        if (!email) return notify("Email is required!");
        else if (!password) return notify("Password is required!");
        else if (password.length < 3 || password.length > 8)
            return notify("Password must be between in 3 and 8 letter!");
        // login request
        setIsLoading(true);
        const { data } = await axios.post(
            loginRoute,
            { email, password },
            { withCredentials: true }
        );
        if (!data) {
            setIsLoading(false);
            return notify("Something went wrong! Please try again.");
        } else {
            if (data.status == "success") {
                const user = {
                    user_id: data.elements.user_id,
                    display_name: data.elements.display_name,
                    avatar_url: data.elements.avatar_url,
                };
                setCurrentUser(user);
                dispatch({
                    type: "ADD_USERS",
                    users: { [user.user_id]: user },
                });
                publicInstance.defaults.headers.common["Authorization"] =
                    data.elements.access_token;
                authInstance.defaults.headers.common["Authorization"] =
                    data.elements.access_token;
                setIsLoading(false);
                navigate("/messenger");
            } else {
                setIsLoading(false);
                if (data.message == "Password is incorrect")
                    return notify("Password is incorrect");
                else if (data.message == "User is not exists")
                    return notify("User is not exists");
                else return notify("Something went wrong! Please try again.");
            }
        }
    };

    const handle_google = (e) => {
        window.location.assign(loginGoogle);
    };

    const hanlde_facebook = (e) => {
        window.location.assign(loginFacebook);
    };

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className={`loading-wrapper ${isLoading && "display"}`}>
                    <img src={Loading} />
                </div>
                <h1 className="welcome">Welcome</h1>
                <h2 className="brand">Nvt app</h2>
                <form className="form" onSubmit={handleSubmit}>
                    <input type="email" placeholder="Enter your email..." />
                    <input
                        type="password"
                        placeholder="Enter your passowrd..."
                    />
                    <div onClick={handle_google} className="oauth-login">
                        <img src={Google} alt="" />
                        <span>Login with google</span>
                    </div>
                    <div onClick={hanlde_facebook} className="oauth-login">
                        <img src={Facebook} alt="" />
                        <span>Login with facebook</span>
                    </div>
                    <div>
                        <span>
                            You don't have an account?
                            <Link to="/register">Register.</Link>
                        </span>
                    </div>
                    <button className="btn-submit" type="submit">
                        Login
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default Login;
