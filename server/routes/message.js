import { client } from "../db/db.config.js";
import { Router } from "express";
import { handleError } from "../helpers/handleError.js";
import {
    addReaction,
    createMessage,
    getMessages,
    getPhotos,
    recallMessge,
    removeReaction,
} from "../controllers/message.js";
import { addLastMessage, getAllMembers } from "../controllers/chat.js";

export const messageRouter = Router();

messageRouter.post("/:chat_id/add_message", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { user_id } = req.user;
        const { text, photo_url, file_url } = req.body;
        const message = await createMessage(client, {
            sender: user_id,
            text,
            photo_url,
            file_url,
            chat_id,
        });
        const add_room = await addLastMessage(client, {
            chat_id,
            message: message.message.id,
            updated: message.message.created_at,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: { message, chat: add_room },
        });
    } catch (e) {
        console.log(e);
        return handleError(e, res);
    }
});

messageRouter.put("/:chat_id/recall_message", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { message, member } = req.body;
        const { members } = await getAllMembers(client, { chat_id });
        if (!members.includes(member))
            throw new Error("Only members have this permission");
        const { message_updated } = await recallMessge(client, {
            message,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: { message: message_updated },
        });
    } catch (e) {
        console.log(e);
        return handleError(e, res);
    }
});

messageRouter.get("/:chat_id/get_messages", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const messages = await getMessages(client, { chat_id });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: messages,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

messageRouter.get("/:chat_id/get_photos", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const photos = await getPhotos(client, { chat_id });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: photos,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

messageRouter.post("/:message_id/add_reaction", async (req, res) => {
    try {
        const message_id = req.params.message_id;
        const { reaction, member } = req.body;
        const message = await addReaction(client, {
            member,
            reaction,
            message_id,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: { message },
        });
    } catch (e) {
        return handleError(e, res);
    }
});

messageRouter.put("/:message_id/remove_reaction", async (req, res) => {
    try {
        const message_id = req.params.message_id;
        const { member } = req.body;
        const message = await removeReaction(client, {
            member,
            message_id,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: { message },
        });
    } catch (e) {
        return handleError(e, res);
    }
});
