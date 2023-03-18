import { useEffect, useState } from "react";
import { socket } from "../websocket/socket.js";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    useEffect(() => {
        const connect = () => {
            socket.on("message", (text) => {
                setMessages((pre) => [...pre, text]);
            });
        };
        return () => {
            connect();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        setMessages([...messages, message]);
        socket.emit("message", message);
        setMessage("");
    };
    return (
        <div>
            <h1>Chat</h1>
            <input
                type="text"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Enter your message..."
            />
            <button onClick={(e) => sendMessage(e)}>Send</button>
            <ul>
                {messages.map((message, index) => {
                    return <li key={index}>{message}</li>;
                })}
            </ul>
        </div>
    );
}

export default Chat;
