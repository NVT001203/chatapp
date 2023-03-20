import { Link } from "react-router-dom";

function Home() {
    const getUser = (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem("chatapp-user");
        console.log(user);
    };
    return (
        <div>
            Home
            <span>
                <button onClick={getUser}>get user</button>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
                <Link to="/fetch_user">fetch_user</Link>
            </span>
        </div>
    );
}

export default Home;
