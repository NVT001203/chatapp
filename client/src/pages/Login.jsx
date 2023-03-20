import { loginGoogle, loginFacebook, loginRoute } from "../config/apiRoute";
import Google from "../imgs/google.png";
import Facebook from "../imgs/facebook.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../imgs/Loading.gif";

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    let loading = false;
    const navigate = useNavigate();
    const notify = (message) => {
        return toast(message);
    };
    useEffect(() => {
        const reset_loading = () => {
            loading = false;
        };
        return () => {
            reset_loading();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;
        if (!email) return notify("Email is required!");
        else if (!password) return notify("Password is required!");
        else if (password.length < 3 || password.length > 8)
            return notify("Password must be between in 3 and 8 letter!");
        // login request
        loading = true;
        setIsLoading(true);
        const { data } = await axios.post(loginRoute, { email, password });
        if (!data) {
            loading = false;
            setIsLoading(false);
            return notify("Something went wrong! Please try again.");
        } else {
            if (data.status == "success") {
                const user = {
                    email,
                    avatar_url: data.elements.avatar_url,
                    display_name: data.elements.display_name,
                    user_id: data.elements.user_id,
                };
                sessionStorage.setItem("chatapp-user", JSON.stringify(user));
                loading = false;
                setIsLoading(false);
                navigate("/");
            } else {
                loading = false;
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
