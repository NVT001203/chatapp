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

userRouter.get("/get_publicInfo/:id", async (req, res) => {
    try {
        const user_id = req.params.id;
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

userRouter.put("/update_publicInfo/:id", async (req, res) => {
    try {
        const { user_id } = req.user;
        const id_req = req.params.id;
        if (user_id != id_req)
            throw new Error("User can only update public info your account");
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

userRouter.get("/get_privateInfo/:id", async (req, res) => {
    try {
        const req_id = req.params.id;
        const { user_id } = req.user;
        if (user_id != req_id)
            throw new Error("User can only get private info your account");
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

userRouter.put("/update_email/:id", async (req, res) => {
    try {
        const req_id = req.params.id;
        const { user_id } = req.user;
        if (req_id != user_id)
            throw new Error("User can only be update your account");
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

userRouter.put("/update_password/:id", async (req, res) => {
    try {
        const req_id = req.params.id;
        const { user_id } = req.user;
        if (req_id != user_id)
            throw new Error("User can only update your account");
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

userRouter.delete("/delete_user/:id", async (req, res) => {
    try {
        const req_id = req.params.id;
        const { user_id } = req.user;
        if (req_id != user_id)
            throw new Error("User can only delete your account");
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

userRouter.put("/:id/hidden_chat", async (req, res) => {
    try {
        const req_id = req.params.id;
        const { user_id } = req.user;
        if (req_id != user_id)
            throw new Error("User can only delete your chat");
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

userRouter.put("/:id/display_chat", async (req, res) => {
    try {
        const req_id = req.params.id;
        const { user_id } = req.user;
        if (req_id != user_id)
            throw new Error("User can only display your chat");
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

userRouter.put("/:id/leave_group", async (req, res) => {
    try {
        const req_id = req.params.id;
        const { user_id } = req.user;
        if (req_id != user_id)
            throw new Error("User can only leave your group on its own");
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
