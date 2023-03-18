import { client } from "../db/db.config.js";
import { Router } from "express";
import {
    addChat,
    displayChat,
    getPublicInfo,
    hiddenChat,
    removeChat,
    updatePublicInfo,
} from "../controllers/user.js";
import { handleError } from "../helpers/handleError.js";
import {
    deleteUser,
    getPrivateInfo,
    updateEmail,
    updatePassword,
} from "../controllers/auth.js";
import { removeMember } from "../controllers/chat.js";

export const userRouter = Router();

userRouter.get("/get_publicInfo", async (req, res) => {
    try {
        const { user_id } = req.user;
        const publicInfo = await getPublicInfo(client, { user_id });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: publicInfo,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

userRouter.put("/update_publicInfo", async (req, res) => {
    try {
        const { user_id } = req.user;
        const { display_name, avatar_url } = req.body;
        const publicInfo = await updatePublicInfo(client, {
            user_id,
            display_name,
            avatar_url,
        });
        res.status(200).json({
            code: 200,
            status: "success",
        });
    } catch (e) {
        return handleError(e, res);
    }
});

userRouter.get("/get_privateInfo", async (req, res) => {
    try {
        const { user_id } = req.user;
        const privateInfo = await getPrivateInfo(client, { id: user_id });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: privateInfo,
        });
    } catch (e) {
        return handleError(e, res);
    }
});

userRouter.put("/update_email", async (req, res) => {
    try {
        const { user_id } = req.user;
        const { new_email } = req.body;
        if (!new_email) throw new Error(`Invalid email`);
        const email = await updateEmail(client, {
            user_id,
            email: new_email,
        });
        res.status(200).json({
            code: 200,
            status: "success",
        });
    } catch (e) {
        return handleError(e, res);
    }
});

userRouter.put("/update_password", async (req, res) => {
    try {
        const { user_id } = req.user;
        const { password, new_password } = req.body;
        if (!password || !new_password) throw new Error(`Invalid password`);
        const pass_updated = await updatePassword(client, {
            user_id,
            password,
            new_password,
        });
        res.status(200).json({
            code: 200,
            status: "success",
        });
    } catch (e) {
        return handleError(e, res);
    }
});

userRouter.delete("/delete_user", async (req, res) => {
    try {
        const { user_id } = req.user;
        const { password } = req.body;
        const deleted = await deleteUser(client, { user_id, password });
        res.status(200).json({
            code: 200,
            status: "success",
        });
    } catch (e) {
        return handleError(e, res);
    }
});

//////// after

userRouter.put("/hidden_chat", async (req, res) => {
    try {
        const { user_id } = req.user;
        const { chat_id } = req.body;
        const hidden = await hiddenChat(client, { user_id, chat_id });
        res.status(200).json({
            code: 200,
            status: "success",
        });
    } catch (e) {
        return handleError(e, res);
    }
});

userRouter.put("/display_chat", async (req, res) => {
    try {
        const { user_id } = req.user;
        const { chat_id } = req.body;
        const display = await displayChat(client, { user_id, chat_id });
        res.status(200).json({
            code: 200,
            status: "success",
        });
    } catch (e) {
        return handleError(e, res);
    }
});

userRouter.put("/leave_group", async (req, res) => {
    try {
        const { user_id } = req.user;
        const { chat_id } = req.body;
        const remove = await removeChat(client, { user_id, chat_id });
        const remove_member = await removeMember(client, { user_id, chat_id });
        res.status(200).json({
            code: 200,
            status: "success",
        });
    } catch (e) {
        return handleError(e, res);
    }
});
