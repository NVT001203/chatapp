import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

function Home() {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    useEffect(() => {
        (() => {
            if (!currentUser) navigate("/register");
        })();
    }, [currentUser]);

    return (
        <div>
            Home
            <div>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
                <Link to="/messenger">messenger</Link>
            </div>
        </div>
    );
}

export default Home;
