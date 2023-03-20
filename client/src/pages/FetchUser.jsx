import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginSuccess } from "../config/apiRoute";
import { ToastContainer, toast } from "react-toastify";
import Loading from "../imgs/Loading.gif";
import "./styles/loading.scss";

function FetchUser() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    let fetching = true;

    useEffect(() => {
        const setUser = async () => {
            fetching = false;
            const { data } = await axios.get(loginSuccess, {
                withCredentials: true,
            });
            if (data.status == "success") {
                sessionStorage.setItem(
                    "chatapp-user",
                    JSON.stringify(data.elements)
                );
                setLoading(false);
                navigate("/");
            } else {
                toast("Fetch user failed! Please try again!");
                setTimeout(() => {
                    return navigate("/login");
                }, 5 * 1000);
                setLoading(false);
            }
        };
        fetching && setUser();
    }, []);

    return (
        <div className="fetch-container">
            {loading && <img src={Loading} className="loading" />}
            <ToastContainer />
        </div>
    );
}

export default FetchUser;
