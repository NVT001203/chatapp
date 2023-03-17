import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});

export const auth = (req, res, next) => {
    try {
        const bearer_token = req.headers["Authorization"];
        if (!bearer_token) {
            res.status(200).json({ code: 401, message: "No token provided" });
        } else {
            const token = bearer_token.split(" ")[1];
            const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
            const payload = jwt.verify(token, access_token_secret);
            req.user = payload;
            next();
        }
    } catch (e) {
        res.status(200).json({ code: 401, message: e.message });
    }
};
