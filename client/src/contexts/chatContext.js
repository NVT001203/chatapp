import { createContext, useContext, useEffect, useState } from "react";
import { StoreContext } from "./StoreContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
    const [currentChat, setCurrentChat] = useState(undefined);
    const { updatedCurrentChat } = useContext(StoreContext);

    useEffect(() => {
        console.log(updatedCurrentChat.chat);
        setCurrentChat(updatedCurrentChat.chat);
    }, [updatedCurrentChat]);

    return (
        <ChatContext.Provider value={{ currentChat, setCurrentChat }}>
            {children}
        </ChatContext.Provider>
    );
};
