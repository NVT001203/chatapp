import { createContext, useEffect, useState } from "react";
import {
    authInstance,
    privateInstance,
    publicInstance,
} from "../config/axiosConfig";
import { socket } from "../socket/socket";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState({});
    const signOut = async () => {
        if (currentUser && currentUser.user_id) {
            return publicInstance
                .delete(`/user/${currentUser.user_id}/sign_out`, {
                    withCredentials: true,
                })
                .then(({ data }) => {
                    if (data.status == "success") {
                        setCurrentUser({});
                        socket.disconnect();
                        return true;
                    } else return false;
                })
                .catch((e) => {
                    return false;
                });
        } else
            return new Promise((resolve, reject) => {
                reject("error");
            });
    };

    useEffect(() => {
        if (Object.keys(currentUser).length == 0) {
            socket.close();
        } else {
            socket.connect();
            socket.emit("user_online", { user_id: currentUser.user_id });
        }
    }, [currentUser.user_id]);

    const refreshToken = async () => {
        return privateInstance
            .get("/get_access_token")
            .then(({ data }) => {
                publicInstance.defaults.headers.common["Authorization"] =
                    data.elements.access_token;
                authInstance.defaults.headers.common["Authorization"] =
                    data.elements.access_token;
                return data;
            })
            .catch((err) => {
                if (
                    err.response.message == "No token provided" ||
                    err.response.message == "Token invalid"
                ) {
                    return new Promise((resolve, reject) =>
                        reject("Token error")
                    );
                } else {
                    if (err.response.message == "jwt expired") {
                        return new Promise((resolve, reject) =>
                            reject("Token expired")
                        );
                    } else
                        return new Promise((resolve, reject) =>
                            reject("Server error")
                        );
                }
            });
    };
    const getUser = async () => {
        try {
            const { data } = await privateInstance.get("/get_user");
            const user = {
                user_id: data.elements.user_id,
                display_name: data.elements.display_name,
                avatar_url: data.elements.avatar_url,
            };
            setCurrentUser(user);
            publicInstance.defaults.headers.common["Authorization"] =
                data.elements.access_token;
            authInstance.defaults.headers.common["Authorization"] =
                data.elements.access_token;
            return user;
        } catch (e) {
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                getUser,
                refreshToken,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
