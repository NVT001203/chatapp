import { createContext, useReducer } from "react";

const chats = {
    id: {
        name: "",
        messages: [],
        chat_avatar: "",
        background_image: "",
    },
};

const messages = {
    id: {
        sender: "",
        text: "",
        photo: "",
        file: "",
    },
};

export const MessageContext = createContext();

export const MessageContextProvider = ({ children }) => {
    <MessageContext.Provider>{children}</MessageContext.Provider>;
};
