import { Router } from "express";
import { client } from "../../db/db.config.js";
import dotenv from "dotenv";
import {
    comparePassword,
    generateAccessToken,
    verifyRefreshToken,
    generateRefreshToken,
    generatePasswordHash,
} from "../../controllers/hash.js";
import {
    addRefreshToken,
    getPrivateInfo,
    getRefreshToken,
    updateRefreshToken,
} from "../../controllers/auth.js";
import { createUser, getPublicInfo } from "../../controllers/user.js";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(200).json({
                code: 400,
                status: "error",
                message: "Please provide email and password",
            });
        } else {
            const user = await getPrivateInfo(client, { email });
            if (comparePassword({ password, hash: user.password })) {
                const access_token = generateAccessToken({ user_id: user.id });
                const refresh_token = generateRefreshToken({
                    user_id: user.id,
                    email,
                });
                await updateRefreshToken(client, {
                    user_id: user.id,
                    token: refresh_token,
                });
                const { display_name, avatar_url } = await getPublicInfo(
                    client,
                    { user_id: user.id }
                );
                return res.status(200).json({
                    code: 200,
                    status: "sucess",
                    elements: {
                        access_token: `Bearer ${access_token}`,
                        refresh_token: `Bearer ${refresh_token}`,
                        display_name,
                        avatar_url,
                        user_id: user.id,
                    },
                });
            } else {
                return res.status(200).json({
                    code: 401,
                    status: "error",
                    message: "Password is incorrect",
                });
            }
        }
    } catch (err) {
        return res.status(200).json({
            code: 500,
            status: "error",
            message:
                err.message == "Update failed!" ? "Server error" : err.message,
        });
    }
});

authRouter.post("/register", async (req, res) => {
    try {
        const { email, password, display_name, avatar_url } = req.body;
        if (!email || !password) {
            return res.status(200).json({
                code: 400,
                status: "error",
                message: "Please provide email and password",
            });
        } else {
            const user = await getPrivateInfo(client, { email });
            if (user) {
                return res.status(200).json({
                    code: 400,
                    status: "error",
                    message: "Email already exists",
                });
            } else {
                const hashedPassword = generatePasswordHash(password);
                const { id } = await createUser(client, {
                    email,
                    password: hashedPassword,
                    display_name,
                    avatar_url,
                });
                const access_token = generateAccessToken({ user_id: id });
                const refresh_token = generateRefreshToken({
                    user_id: id,
                    email,
                });
                await addRefreshToken(client, {
                    user_id: id,
                    token: refresh_token,
                });
                res.status(200).json({
                    code: 200,
                    status: "Success",
                    elements: {
                        access_token: `Bearer ${access_token}`,
                        refresh_token: `Bearer ${refresh_token}`,
                        user_id: id,
                        display_name,
                        avatar_url,
                    },
                });
            }
        }
    } catch (err) {
        return res.status(200).json({
            code: 500,
            status: "error",
            message:
                err.message == "Update failed!" ? "Server error" : err.message,
        });
    }
});

authRouter.get("/get_access_token", async (req, res) => {
    try {
        const bearer_token = req.headers["authorization"];
        if (!bearer_token) {
            return res.status(200).json({
                code: 401,
                status: "error",
                message: "No token provided",
            });
        } else {
            const refresh_token = bearer_token.split(" ")[1];
            const { user_id, email } = verifyRefreshToken({
                token: refresh_token,
            });
            if ((await getRefreshToken(client, { user_id })) == refresh_token) {
                const access_token = generateAccessToken({ user_id });
                const refresh_token = generateRefreshToken({
                    user_id,
                    email,
                });
                await updateRefreshToken(client, {
                    user_id,
                    token: refresh_token,
                });
                return res.status(200).json({
                    code: 200,
                    status: "sucess",
                    elements: {
                        access_token: `Bearer ${access_token}`,
                        refresh_token: `Bearer ${refresh_token}`,
                    },
                });
            } else throw new Error();
        }
    } catch (err) {
        return res.status(200).json({
            code: 401,
            status: "error",
            message:
                err.message == "No token provided"
                    ? err.message
                    : "Token invalid",
        });
    }
});
