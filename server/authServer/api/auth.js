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
import jwt from "jsonwebtoken";

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
            if (!user)
                res.status(400).json({
                    status: "error",
                    code: 400,
                    message: "User is not exists",
                });
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
                    status: "success",
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
                    status: "success",
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

authRouter.get("/success", async (req, res) => {
    try {
        const bearer_token = req.cookies["token"];
        const refresh_token = bearer_token.split(" ")[1];
        res.clearCookie("token");
        const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
        const { user_id, email } = jwt.verify(
            refresh_token,
            refresh_token_secret
        );

        const { display_name, avatar_url } = await getPublicInfo(client, {
            user_id,
        });
        const access_token = generateAccessToken({ user_id });
        const refresh_token_update = generateRefreshToken({
            user_id,
            email,
        });
        const update_token = await updateRefreshToken(client, {
            user_id,
            token: refresh_token_update,
        });
        res.status(200).json({
            code: 200,
            status: "success",
            elements: {
                user_id,
                email,
                display_name,
                avatar_url,
                token: {
                    refresh_token: `Bearer ${refresh_token_update}`,
                    access_token: `Bearer ${access_token}`,
                },
            },
        });
    } catch (e) {
        if (e.name == "JsonWebTokenError")
            re.status(401).json({
                code: 401,
                status: "error",
                message: "Invalid token",
            });
        else if (
            e.message == "Cannot read properties of undefined (reading 'split')"
        )
            res.status(403).json({
                code: 403,
                status: "error",
                message: "Token not avaiable",
            });
        else {
            res.status(500).json({
                code: 500,
                status: "error",
                message: "Server error",
            });
        }
    }
});
