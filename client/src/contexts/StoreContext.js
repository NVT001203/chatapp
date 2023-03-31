import { createContext, useReducer } from "react";

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

const initialStore = {
    chats,
    messages,
    users,
    photos,
};

const reducer = (state, action) => {
    switch (action.type) {
        case "ADD_MESSAGE": {
            return {
                chats: { ...state.chats },
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
                users: { ...state.users },
                photos: { ...state.photos },
            };
        }
        case "RECALL_MESSAGE": {
            return {
                chats: { ...state.chats },
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
                users: { ...state.users },
                photos: { ...state.photos },
            };
        }
        case "ADD_USERS": {
            return {
                users: { ...state.users, ...action.users },
                chats: { ...state.chats },
                messages: { ...state.messages },
                photos: { ...state.photos },
            };
        }
        case "ADD_CHATS": {
            return {
                users: { ...state.users },
                chats: { ...state.chats, ...action.chats },
                messages: { ...state.messages },
                photos: { ...state.photos },
            };
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

            return {
                users: { ...state.users },
                chats: { ...state.chats },
                messages,
                photos: { ...state.photos },
            };
        }
        case "ADD_PHOTO": {
            return {
                users: { ...state.users },
                chats: { ...state.chats },
                messages: { ...state.messages },
                photos: {
                    ...state.photos,
                    [action.photo.chat_id]: state.photos[action.photo.chat_id]
                        ? {
                              ...state.photos[action.photo.chat_id],
                              [action.photo.id]: action.photo,
                          }
                        : { [action.photo.id]: action.photo },
                },
            };
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
            console.log(photos);
            return {
                users: { ...state.users },
                chats: { ...state.chats },
                messages: { ...state.messages },
                photos,
            };
        }
        case "ADD_MESSAGE_DONE": {
            delete state.messages[action.message.chat_id][action.id];
            return {
                chats: { ...state.chats },
                messages: {
                    ...state.messages,
                    [action.message.chat_id]: {
                        ...state.messages[action.message.chat_id],
                        [action.message.id]: action.message,
                    },
                },
                users: { ...state.users },
                photos: { ...state.photos },
            };
        }
        case "REMOVE_MESSAGE_FAILURE": {
            delete state.messages[action.message.chat_id][action.id];
            return state;
        }
        default:
            return state;
    }
};

export const StoreContext = createContext();

export const StoreContextProvider = ({ children }) => {
    const [store, dispatch] = useReducer(reducer, initialStore);
    // useEffect(() => {
    //     console.log(store);
    // }, [store]);
    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
};
