import { client } from "../db/db.config.js";
import { Router } from "express";
import { handleError } from "../helpers/handleError.js";
import {
    addAdmins,
    addMembers,
    checkChatExists,
    createChat,
    createGroupChat,
    getAdmins,
    getAllMembers,
    removeMember,
    setBackground,
    setChatAvatar,
    setGroupName,
} from "../controllers/chat.js";
import { addChat, removeChat } from "../controllers/user.js";
import { getMessages } from "../controllers/message.js";

export const chatRouter = Router();

chatRouter.post("/create_chat", async (req, res) => {
    try {
        const { user_id } = req.user;
        const friend_id = req.body.user_id;
        const chatExists = await checkChatExists(client, {
            users_id: [user_id, friend_id],
        });

        if (chatExists.exists) {
            const messages = await getMessages(client, {
                chat_id: chatExists.chat.id,
            });
            res.status(200).json({
                code: 200,
                status: "success",
                message: "Chat is exists",
                elements: { chat: chatExists.chat, messages },
            });
        } else {
            const chat = await createChat(client, { user_id, friend_id });
            await addChat(client, { chat_id: chat.id, user_id });
            await addChat(client, { chat_id: chat.id, user_id: friend_id });
            res.status(200).json({
                code: 200,
                status: "success",
                elements: { chat },
            });
        }
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.post("/create_group", async (req, res) => {
    try {
        const { user_id } = req.user;
        let members = req.body.members;
        members = [user_id, ...members];
        const chat = await createGroupChat(client, { members });
        let n = members.length;
        while (n-- > 0) {
            await addChat(client, { chat_id: chat.id, user_id: members[n] });
        }
        res.status(200).json({
            code: 200,
            status: "success",
            elements: chat,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/add_members/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.id;
        const { members } = req.body;
        let n = members.length;
        while (n-- > 0) {
            await addChat(client, { chat_id, user_id: members[n] });
        }
        const members_updated = await addMembers(client, { chat_id, members });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: members_updated,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/add_admins/:chat_id", async (req, res) => {
    try {
        const { user_id } = req.user;
        const chat_id = req.params.chat_id;
        const { members } = req.body;
        const { admins } = await getAdmins(client, { chat_id });
        if (!admins.includes(user_id)) throw new Error("User is not admin");
        {
            const members_updated = await addAdmins(client, {
                chat_id,
                members,
            });
            res.status(200).json({
                code: 200,
                status: "success",
                elements: members_updated,
            });
        }
    } catch (e) {
        return handleError(e, res);
    }
});

// chatRouter.get("/get_AdminList", async (req, res) => {
//     try {
//         const { chat_id } = req.body;
//         const admins = await getAdmins(client, { chat_id });
//         res.status(200).json({
//             code: 200,
//             status: "success",
//             elements: admins,
//         });
//     } catch (e) {
//         return handleError(e, res);
//     }
// });

chatRouter.delete("/remove_member/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const { member } = req.body;
        const { admins } = await getAdmins(client, { chat_id });
        if (admins.includes(user_id)) {
            const members = await removeMember(client, {
                chat_id,
                user_id: member,
            });
            await removeChat(client, { user_id: member, chat_id });
            res.status(200).json({
                code: 200,
                status: "success",
                elements: members,
            });
        } else throw new Error("User is not admin");
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/set_groupName/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const { members } = await getAllMembers(client, { chat_id });
        if (!members.includes(chat_id))
            throw new Error("User can only set name your group");
        const { name } = req.body;
        const group = await setGroupName(client, {
            chat_id,
            name,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: group,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/set_groupBackground/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const { members } = await getAllMembers(client, { chat_id });
        if (!members.includes)
            throw new Error("User can only set background your group");
        const { background_image } = req.body;
        const group = await setBackground(client, {
            chat_id,
            background_image,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: group,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/get_members/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const { members } = await getAllMembers(client, { chat_id });
        if (!members.includes)
            throw new Error("User can only get members your group");
        res.status(200).json({
            code: 200,
            status: "success",
            elements: members,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/set_chatAvatar/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { chat_avatar } = req.body;
        const { user_id } = req.user;
        const { members } = await getAllMembers(client, { chat_id });
        if (!members.includes)
            throw new Error("User can only get members your group");
        const changed = await setChatAvatar(client, { chat_id, chat_avatar });
        res.status(200).json({
            code: 200,
            status: (changed && "success") || "error",
        });
    } catch (e) {
        return handleError(e, res);
    }
});
