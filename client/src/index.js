import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./contexts/authContext";
import { ChatContextProvider } from "./contexts/chatContext";
import { StoreContextProvider } from "./contexts/StoreContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthContextProvider>
        <StoreContextProvider>
            <ChatContextProvider>
                <App />
            </ChatContextProvider>
        </StoreContextProvider>
    </AuthContextProvider>
);
