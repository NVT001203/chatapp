import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState,
} from "react";
import { AuthContext } from "./authContext";
import { socket } from "../socket/socket";

const chats = {
    // id: {
    //     id: "",
    //     name: "",
    //     is_group: "",
    //     chat_avatar: "",
    //     members: [],
    //     admins: "",
    //     last_message: "",
    //     background_image: "",
    //     updated_at: "",
    // },
};

const messages = {
    // chat_id: {
    //     id: {
    //         id: "",
    //         chat_id: "",
    //         sender: "",
    //         text: "",
    //         photo_url: "",
    //         file_url: "",
    //         recall: false,
    //         background_image: null,
    //         created_at: "",
    //     },
    // },
};

const users = {
    // id: {
    //     user_id: "",
    //     display_name: "",
    //     avatar_url: "",
    // },
};

const photos = {
    // chat_id: {
    //     id :{
    //         id: "",
    //         photo_url: "",
    //         chat_id: "",
    //         created_at: "",
    //     }
    // }
};

let initialStore = {
    chats,
    messages,
    users,
    photos,
};

const reducer = (state = initialStore, action) => {
    switch (action.type) {
        case "ADD_MESSAGE": {
            return (initialStore = {
                ...state,
                messages: {
                    ...state.messages,
                    [action.message.chat_id]: state.messages[
                        action.message.chat_id
                    ]
                        ? {
                              ...state.messages[action.message.chat_id],
                              [action.message.id]: action.message,
                          }
                        : { [action.message.id]: action.message },
                },
            });
        }
        case "RECALL_MESSAGE": {
            return (initialStore = {
                ...state,
                messages: {
                    ...state.messages,
                    [action.message.chat_id]: {
                        ...action.message.chat_id,
                        text: null,
                        photo_url: null,
                        file_url: null,
                        recall: true,
                    },
                },
            });
        }
        case "ADD_USERS": {
            return (initialStore = {
                ...state,
                users: { ...state.users, ...action.users },
            });
        }
        case "REMOVE_USER": {
            delete state.users[action.user_id];
            return (initialStore = state);
        }
        case "ADD_CHATS": {
            return (initialStore = {
                ...state,
                chats: { ...state.chats, ...action.chats },
            });
        }
        case "REMOVE_CHAT": {
            delete state.chats[action.chat_id];
            return (initialStore = state);
        }
        case "LEAVE_GROUP": {
            delete state.chats[action.chat_id];
            return (initialStore = state);
        }
        case "ADD_MESSAGES": {
            let messages = state.messages;
            for (const message of action.messages) {
                messages = {
                    ...messages,
                    [message.chat_id]: messages[message.chat_id]
                        ? {
                              ...messages[message.chat_id],
                              [message.id]: message,
                          }
                        : { [message.id]: message },
                };
            }

            return (initialStore = {
                ...state,
                messages,
            });
        }
        case "ADD_PHOTO": {
            return (initialStore = {
                ...state,
                photos: {
                    ...state.photos,
                    [action.photo.chat_id]: state.photos[action.photo.chat_id]
                        ? {
                              ...state.photos[action.photo.chat_id],
                              [action.photo.id]: action.photo,
                          }
                        : { [action.photo.id]: action.photo },
                },
            });
        }
        case "ADD_PHOTOS": {
            let photos = state.photos;
            for (const photo of action.photos) {
                photos = {
                    ...photos,
                    [photo.chat_id]: photos[photo.chat_id]
                        ? {
                              ...photos[photo.chat_id],
                              [photo.id]: photo,
                          }
                        : { [photo.id]: photo },
                };
            }
            return (initialStore = {
                ...state,
                photos,
            });
        }
        case "ADD_MESSAGE_DONE": {
            delete state.messages[action.message.chat_id][action.id];
            return (initialStore = {
                ...state,
                messages: {
                    ...state.messages,
                    [action.message.chat_id]: {
                        ...state.messages[action.message.chat_id],
                        [action.message.id]: action.message,
                    },
                },
            });
        }
        case "REMOVE_MESSAGE_FAILURE": {
            delete state.messages[action.message.chat_id][action.id];
            return (initialStore = state);
        }
        case "ADD_FRIENDS": {
            return {
                ...state,
                friends: {
                    [action.user_id]: state.friends
                        ? {
                              ...state.friends[action.user_id],
                              ...action.friends,
                          }
                        : { ...action.friends },
                },
            };
        }
        case "REMOVE_FRIEND": {
            let new_state = state;
            delete new_state.friends[action.user_id][action.friend_id];
            return new_state;
        }
        default:
            return (initialStore = state);
    }
};

const sortChats = (chats) => {
    let objsort = {};
    Object.entries(chats).forEach(([key, value]) => {
        objsort[value.updated_at] = key;
    });
    return Object.entries(objsort).sort();
};

export const StoreContext = createContext();

export const StoreContextProvider = ({ children }) => {
    const [store, dispatch] = useReducer(reducer, initialStore);

    useEffect(() => {
        console.log({ friends: store.friends, users: store.users });
    }, [store.friends]);

    return (
        <StoreContext.Provider
            value={{
                store,
                dispatch,
                sortChats,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
};
