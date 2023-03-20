import { Router } from "express";
import { authorizationUrl } from "../Oauth/google.js";
import { oauth2Client } from "../Oauth/google.js";
import axios from "axios";
import { createUserOauth, getPublicInfo } from "../../controllers/user.js";
import { client } from "../../db/db.config.js";
import { generateRefreshToken } from "../../controllers/hash.js";
import {
    addRefreshToken,
    getPrivateInfo,
    updateRefreshToken,
} from "../../controllers/auth.js";
import dotenv from "dotenv";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
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
            const refresh_token = generateRefreshToken({
                user_id: user.id,
                email: googleUser.email,
            });
            await updateRefreshToken(client, {
                user_id: user.id,
                token: refresh_token,
            });
            return res
                .cookie("token", `Bearer ${refresh_token}`, {
                    httpOnly: true,
                    secure: true,
                })
                .redirect(`${process.env.CLIENT_URL}/fetch_user`);
        } else {
            const { id } = await createUserOauth(client, {
                email: googleUser.email,
                display_name: googleUser.name,
                avatar_url: googleUser.picture,
                oauth_id: googleUser.id,
            });
            const refresh_token = generateRefreshToken({
                user_id: id,
                email: googleUser.email,
            });
            await addRefreshToken(client, {
                user_id: id,
                token: refresh_token,
            });
            res.status(200)
                .cookie("token", `Bearer ${refresh_token}`, {
                    httpOnly: true,
                    secure: true,
                })
                .redirect(`${process.env.CLIENT_URL}/fetch_user`);
        }
    } catch (err) {
        res.status(200).json({
            code: 500,
            status: "error",
            message: err.message,
        });
    }
});
