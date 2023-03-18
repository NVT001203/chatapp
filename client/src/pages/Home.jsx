import { useEffect } from "react";
import { Link } from "react-router-dom";
import { socket } from "../websocket/socket";

function Home() {
    useEffect(() => {
        const connect = () => {
            socket.on("connect", () => {
                console.log(`socket id ${socket.id} connected`);
            });
            socket.on("disconnect", () => {
                console.log(`socket id ${socket.id} disconnected`);
            });
        };
        return () => {
            connect();
        };
    }, []);

    return (
        <div>
            Home
            <span>
                <Link to="/chat">to chat</Link>
            </span>
        </div>
    );
}

export default Home;
