import { Router } from "express";
import { addRefreshToken, getPrivateInfo } from "../../controllers/auth.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../../controllers/hash.js";
import { createUserOauth, getPublicInfo } from "../../controllers/user.js";
import {
    facebookLoginUrl,
    getAccessTokenFromCode,
    getFacebookUserData,
} from "../Oauth/facebook.js";
import { client } from "../../db/db.config.js";

export const facebookRouter = Router();

facebookRouter.get("/", (req, res) => {
    res.redirect(facebookLoginUrl);
});

facebookRouter.get("/callback", async (req, res) => {
    try {
        const code = req.query.code;
        const access_token = await getAccessTokenFromCode(code);
        const facebookUser = await getFacebookUserData(access_token);
        const user = await getPrivateInfo(client, {
            email: facebookUser.email,
        });
        if (user) {
            const publicInfo = await getPublicInfo(client, {
                user_id: user.id,
            });
            const access_token = generateAccessToken({ user_id: user.id });
            const refresh_token = generateRefreshToken({
                user_id: user.id,
                email: facebookUser.email,
            });
            await addRefreshToken(client, {
                user_id: user.id,
                token: refresh_token,
            });
            return res.status(200).json({
                code: 200,
                message: "Success",
                elements: {
                    access_token: `Bearer ${access_token}`,
                    refresh_token: `Bearer ${refresh_token}`,
                    user_id: user.id,
                    display_name: publicInfo.display_name,
                    avatar_url: publicInfo.avatar_url,
                },
            });
        } else {
            console.log({
                email: facebookUser.email,
                display_name: `${facebookUser.first_name} ${facebookUser.last_name}`,
                avatar_url: facebookUser.picture.data.url,
                oauth_id: facebookUser.id,
            });
            const { id } = await createUserOauth(client, {
                email: facebookUser.email,
                display_name: `${facebookUser.first_name} ${facebookUser.last_name}`,
                avatar_url: facebookUser.picture.data.url,
                oauth_id: facebookUser.id,
            });
            const access_token = generateAccessToken({ user_id: id });
            const refresh_token = generateRefreshToken({
                user_id: id,
                email: facebookUser.email,
            });
            await addRefreshToken(client, {
                user_id: id,
                token: refresh_token,
            });
            res.status(200).json({
                code: 200,
                message: "Success",
                elements: {
                    access_token: `Bearer ${access_token}`,
                    refresh_token: `Bearer ${refresh_token}`,
                    user_id: id,
                    display_name:
                        facebookUser.first_name + " " + facebookUser.last_name,
                    avatar_url: facebookUser.picture.data.url,
                },
            });
        }
    } catch (err) {
        res.status(200).json({
            code: 500,
            message: err.message,
        });
    }
});
