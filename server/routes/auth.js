import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { handleError } from "../helpers/handleError.js";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});

export const auth = (req, res, next) => {
    try {
        const bearer_token = req.headers.authorization;
        if (!bearer_token) {
            res.status(401).json({
                code: 401,
                status: "error",
                message: "No token provided",
            });
        } else {
            const token = bearer_token.split(" ")[1];
            const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
            const payload = jwt.verify(token, access_token_secret);
            req.user = payload;
            next();
        }
    } catch (e) {
        return handleError(e, res);
    }
};
