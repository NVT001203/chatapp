import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const client_id = process.env.FACEBOOK_CLIENT_ID;
const client_secret = process.env.FACEBOOK_CLIENT_SECRET;
const redirect_uri = "http://localhost:5051/auth/facebook/callback";
const scope = ["email", "public_profile"].join(",");

const stringifiedParams = `client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=code&auth_type=rerequest&display=popup`;

export const facebookLoginUrl = `https://www.facebook.com/v16.0/dialog/oauth?${stringifiedParams}`;

export async function getAccessTokenFromCode(code) {
    const { data } = await axios({
        url: "https://graph.facebook.com/v16.0/oauth/access_token",
        method: "get",
        params: {
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri,
            code,
        },
    });

    return data.access_token;
}

export async function getFacebookUserData(access_token) {
    const { data } = await axios({
        url: "https://graph.facebook.com/me",
        method: "get",
        params: {
            fields: ["id", "email", "first_name", "last_name", "picture"].join(
                ","
            ),
            access_token: access_token,
        },
    });
    return data;
}
