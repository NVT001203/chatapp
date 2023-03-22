import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loading from "../imgs/Loading.gif";
import "./styles/loading.scss";
import { privateInstance } from "../config/axiosConfig";
import { AuthContext } from "../contexts/authContext";
import { socket } from "../websocket/socket";

function FetchUser() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { setCurrentUser } = useContext(AuthContext);
    let fetching = true;

    useEffect(() => {
        const setUser = () => {
            fetching = false;
            privateInstance
                .get("/success", {
                    withCredentials: true,
                })
                .then(({ data }) => {
                    console.log(data);
                    if (data.status == "success") {
                        const user = {
                            user_id: data.elements.user_id,
                            display_name: data.elements.display_name,
                            email: data.elements.email,
                            avatar_url: data.elements.avatar_url,
                        };
                        setCurrentUser(user);
                        setLoading(false);
                        navigate("/messenger");
                    } else {
                        setLoading(false);
                    }
                })
                .catch(function (error) {
                    navigate("/login");
                });
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
