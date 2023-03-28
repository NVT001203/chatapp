import { client } from "../db/db.config.js";
import { Router } from "express";
import { handleError } from "../helpers/handleError.js";
import {
    createMessage,
    getMessages,
    recallMessge,
} from "../controllers/message.js";
import { addLastMessage } from "../controllers/chat.js";

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
            message: message.id,
            updated: message.created_at,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: message,
        });
    } catch (e) {
        console.log(e);
        return handleError(e, res);
    }
});

messageRouter.delete("/:chat_id/recall_message", async (req, res) => {
    try {
        const chat_id = req.params.chat_id;
        const { message } = req.body;
        const messageRecall = await recallMessge(client, {
            message,
        });
        res.status(200).json({
            code: 200,
            status: messageRecall.recall ? "success" : "error",
        });
    } catch (e) {
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
