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
    checkUserExists,
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

authRouter.post("/get_userExists", async (req, res) => {
    const { email } = req.body;
    if (await checkUserExists(client, { email }))
        res.status(200).json({ status: "success", code: 200, message: "OK" });
    else
        res.status(200).json({
            status: "success",
            code: 200,
            message: "Email already exists",
        });
});

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
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
                res.cookie("token", `Bearer ${refresh_token}`, {
                    httpOnly: true,
                    secure: true,
                });
                res.status(200).json({
                    code: 200,
                    status: "success",
                    elements: {
                        access_token: `Bearer ${access_token}`,
                        display_name,
                        avatar_url,
                        user_id: user.id,
                    },
                });
            } else {
                res.status(401).json({
                    code: 401,
                    status: "error",
                    message: "Password is incorrect",
                });
            }
        }
    } catch (err) {
        res.status(500).json({
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
            res.status(400).json({
                code: 400,
                status: "error",
                message: "Please provide email and password",
            });
        } else {
            const user = await getPrivateInfo(client, { email });
            if (user) {
                return res.status(400).json({
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
                res.cookie("token", `Bearer ${refresh_token}`, {
                    httpOnly: true,
                    secure: true,
                });
                res.status(200).json({
                    code: 200,
                    status: "success",
                    elements: {
                        access_token: `Bearer ${access_token}`,
                        user_id: id,
                        display_name,
                        avatar_url,
                    },
                });
            }
        }
    } catch (err) {
        res.status(500).json({
            code: 500,
            status: "error",
            message:
                err.message == "Update failed!" ? "Server error" : err.message,
        });
    }
});

authRouter.get("/get_access_token", async (req, res) => {
    try {
        const bearer_token = req.cookies["token"];
        if (!bearer_token) {
            res.status(401).json({
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
                const refresh_token_updated = generateRefreshToken({
                    user_id,
                    email,
                });
                await updateRefreshToken(client, {
                    user_id,
                    token: refresh_token_updated,
                });
                res.cookie("token", `Bearer ${refresh_token_updated}`, {
                    httpOnly: true,
                    secure: true,
                })
                    .status(200)
                    .json({
                        code: 200,
                        status: "sucess",
                        elements: {
                            access_token: `Bearer ${access_token}`,
                        },
                    });
            } else throw new Error();
        }
    } catch (err) {
        res.status(401).json({
            code: 401,
            status: "error",
            message:
                err.message == "No token provided"
                    ? err.message
                    : "Token invalid",
        });
    }
});

authRouter.get("/get_user", async (req, res) => {
    try {
        const bearer_token = req.cookies["token"];
        const refresh_token = bearer_token.split(" ")[1];
        const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
        const { user_id, email } = jwt.verify(
            refresh_token,
            refresh_token_secret
        );
        if ((await getRefreshToken(client, { user_id })) == refresh_token) {
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
            res.cookie("token", `Bearer ${refresh_token_update}`, {
                httpOnly: true,
                secure: true,
            })
                .status(200)
                .json({
                    code: 200,
                    status: "success",
                    elements: {
                        user_id,
                        display_name,
                        avatar_url,
                        access_token: `Bearer ${access_token}`,
                    },
                });
        } else throw new Error("Token not found");
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
        else if (e.message == "Token not found")
            res.status(404).json({
                code: 404,
                status: "error",
                message: "Token not found",
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
