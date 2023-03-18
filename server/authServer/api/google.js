import { Router } from "express";
import { authorizationUrl } from "../Oauth/google.js";
import { oauth2Client } from "../Oauth/google.js";
import axios from "axios";
import { createUserOauth, getPublicInfo } from "../../controllers/user.js";
import { client } from "../../db/db.config.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../../controllers/hash.js";
import { addRefreshToken, getPrivateInfo } from "../../controllers/auth.js";

export const googleRouter = Router();

googleRouter.get("/", (req, res) => {
    res.redirect(authorizationUrl);
});

googleRouter.get("/callback", async (req, res) => {
    try {
        const code = req.query.code;
        const { tokens } = await oauth2Client.getToken(code);
        const googleUser = await axios
            .get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens.id_token}`,
                    },
                }
            )
            .then((res) => res.data)
            .catch((error) => {
                throw new Error(error.message);
            });
        const user = await getPrivateInfo(client, { email: googleUser.email });
        if (user) {
            const publicInfo = await getPublicInfo(client, {
                user_id: user.id,
            });
            const access_token = generateAccessToken({ user_id: user.id });
            const refresh_token = generateRefreshToken({
                user_id: user.id,
                email: googleUser.email,
            });
            await updateRefreshToken(client, {
                user_id: user.id,
                token: refresh_token,
            });
            return res.status(200).json({
                code: 200,
                status: "success",
                elements: {
                    access_token: `Bearer ${access_token}`,
                    refresh_token: `Bearer ${refresh_token}`,
                    user_id: user.id,
                    display_name: publicInfo.display_name,
                    avatar_url: publicInfo.avatar_url,
                },
            });
        } else {
            const { id } = await createUserOauth(client, {
                email: googleUser.email,
                display_name: googleUser.name,
                avatar_url: googleUser.picture,
                oauth_id: googleUser.id,
            });
            const access_token = generateAccessToken({ user_id: id });
            const refresh_token = generateRefreshToken({
                user_id: id,
                email: googleUser.email,
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
                    display_name: googleUser.name,
                    avatar_url: googleUser.picture,
                },
            });
        }
    } catch (err) {
        res.status(200).json({
            code: 500,
            status: "error",
            message: err.message,
        });
    }
});
