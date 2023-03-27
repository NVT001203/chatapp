import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import catLoading from "../imgs/LoadingError.gif";
import { ToastContainer, toast } from "react-toastify";
import "./styles/loadingError.scss";

function LoadingError() {
    const navigate = useNavigate();
    useEffect(() => {
        toast("Failure to loading resource! Please try again.");
        setTimeout(() => {
            navigate("/login");
        }, 6000);
    }, []);

    return (
        <div className="error_loading">
            <img src={catLoading} />
            <h3>Failure to load resource :))</h3>
            <ToastContainer />
        </div>
    );
}

export default LoadingError;
