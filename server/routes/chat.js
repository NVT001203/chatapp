import { client } from "../db/db.config.js";
import { Router } from "express";
import { handleError } from "../helpers/handleError.js";
import {
    addAdmins,
    addMembers,
    checkChatExists,
    createChat,
    createGroupChat,
    deleteChat,
    getAdmins,
    getAllMembers,
    removeMember,
    setBackground,
    setChatAvatar,
    setGroupName,
} from "../controllers/chat.js";
import { addChat, removeChat, removeChats } from "../controllers/user.js";
import {
    createAddAdminNotice,
    createAddAndRemoveMembersNotices,
    createNotice,
    deleteMessages,
    getMessages,
} from "../controllers/message.js";
import { getChat } from "../controllers/chat.js";

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
            const notice = await createNotice(client, {
                sender: user_id,
                chat_id: chat.id,
                text: "Chat created!",
                chat_created: true,
            });
            await addChat(client, { chat_id: chat.id, user_id });
            await addChat(client, { chat_id: chat.id, user_id: friend_id });
            res.status(200).json({
                code: 200,
                status: "success",
                elements: { chat, notice },
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
        const notice = await createNotice(client, {
            text: "Chat created!",
            sender: user_id,
            chat_id: chat.id,
            chat_created: true,
        });
        let n = members.length;
        while (n-- > 0) {
            await addChat(client, { chat_id: chat.id, user_id: members[n] });
        }
        res.status(200).json({
            code: 200,
            status: "success",
            elements: { chat, notice },
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/add_members/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        let { members } = req.body;
        const chat_members = (await getAllMembers(client, { chat_id })).members;
        members = members.filter((e) => !chat_members.includes(e));
        if (members.length == 0) {
            return res.status(200).json({
                code: 200,
                status: "error",
                message: "members already exists",
            });
        }
        let n = members.length;
        while (n-- > 0) {
            await addChat(client, { chat_id, user_id: members[n] });
        }
        const notices = await createAddAndRemoveMembersNotices(client, {
            user_id,
            members,
            chat_id,
            add: true,
        });
        const members_updated = await addMembers(client, {
            chat_id,
            members,
            last_message: notices[notices.length - 1].id,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: { chat: members_updated, notices },
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
        if (!admins.includes(user_id))
            throw new Error("Only admins have this permission");
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

chatRouter.put("/remove_member/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const { member } = req.body;
        const chat = await getChat(client, { chat_id });

        if (!chat.members.includes(member))
            throw new Error("The user is not a member of the group");
        if (chat.admins.includes(user_id)) {
            const chat = await removeMember(client, {
                chat_id,
                user_id: member,
            });

            const notice = await createAddAndRemoveMembersNotices(client, {
                user_id,
                members: [member],
                chat_id,
                add: false,
            });
            await removeChat(client, { user_id: member, chat_id });
            res.status(200).json({
                code: 200,
                status: "success",
                elements: { chat, notice },
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
        if (!members.includes(user_id))
            throw new Error("Only members have this permission");
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
        if (!members.includes(user_id))
            throw new Error("Only members have this permission");
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
        if (!members.includes(user_id))
            throw new Error("Only members have this permission");
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
        if (!members.includes(user_id))
            throw new Error("Only members have this permission");
        const chat = await setChatAvatar(client, { chat_id, chat_avatar });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: chat,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.delete("/delete_chat/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const chat = await getChat(client, { chat_id });
        if (chat.is_group) {
            if (!chat.admins.includes(user_id)) {
                throw new Error("Only admins have this permission");
            } else {
                const chat_deleted = await deleteChat(client, { chat_id });
                const users = await removeChats(client, {
                    chat_id,
                    users_id: chat.members,
                });
                await deleteMessages(client, { chat_id });
                res.status(200).json({
                    code: 200,
                    status: "success",
                    elements: { chat: chat_deleted, members: users },
                });
            }
        } else {
            if (!chat.members.includes(user_id))
                throw new Error("Only members have this permission");

            const chat_deleted = await deleteChat(client, { chat_id });
            const users = await removeChats(client, {
                chat_id,
                users_id: chat.members,
            });
            await deleteMessages(client, { chat_id });
            res.status(200).json({
                code: 200,
                status: "success",
                elements: { chat: chat_deleted, members: users },
            });
        }
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.delete("/leave_group/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const { members } = await getAllMembers(client, { chat_id });
        if (!members.includes(user_id))
            throw new Error("Only members have this permission");
        const chat = await removeMember(client, { chat_id, user_id });
        const { id, display_name, chats, avatar_url } = await removeChat(
            client,
            { user_id, chat_id }
        );
        const notice = await createNotice(client, {
            text: `${display_name} was leave to group`,
            sender: id,
            chat_id,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: { chat, notice, member: user_id },
        });
    } catch (e) {
        return handleError(e, res);
    }
});

chatRouter.put("/add_admin/:chat_id", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { member } = req.body;
        const { user_id } = req.user;
        const chat = await getChat(client, { chat_id });

        if (!chat.admins.includes(user_id))
            throw new Error("Only members have this permission");
        if (!chat.members.includes(member))
            throw new Error("The user is not a member of the group");
        if (chat.admins.includes(member))
            res.status(200).json({
                code: 200,
                status: "error",
                message: "Member is admin",
            });
        else {
            const chat_updated = await addAdmins(client, {
                chat_id,
                members: [member],
            });
            const notice = await createAddAdminNotice(client, {
                user_id,
                member,
                chat_id,
            });
            res.status(200).json({
                code: 200,
                status: "success",
                elements: { chat: chat_updated, notice },
            });
        }
    } catch (e) {
        return handleError(e, res);
    }
});
