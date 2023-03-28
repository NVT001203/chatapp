import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loading from "../imgs/Loading.gif";
import "./styles/loading.scss";
import { AuthContext } from "../contexts/authContext";
import { StoreContext } from "../contexts/StoreContext";

function FetchUser() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { getUser } = useContext(AuthContext);
    const { dispatch } = useContext(StoreContext);
    let mounted = true;

    useEffect(() => {
        const setUser = async () => {
            mounted = false;
            await getUser()
                .then((user) => {
                    dispatch({
                        type: "ADD_USERS",
                        users: { [user.user_id]: user },
                    });
                    setLoading(false);
                    navigate("/messenger");
                })
                .catch((bool) => {
                    navigate("/login");
                });
        };
        mounted && setUser();
    }, []);

    return (
        <div className="fetch-container">
            {loading && <img src={Loading} className="loading" />}
            <ToastContainer />
        </div>
    );
}

export default FetchUser;
