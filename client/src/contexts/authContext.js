import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

function AuthContextProvider({ chidren }) {
    const [currentUser, setCurrentUser] = useState(undefined);

    useEffect(() => {
        const setter = () => {
            setCurrentUser(sessionStorage.getItem("chatapp-user"));
        };
        return setter();
    }, []);

    return (
        <AuthContext.Provider value={currentUser}>
            {chidren}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
