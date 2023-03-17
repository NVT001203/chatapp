import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

export const generatePasswordHash = (password) => {
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

export const comparePassword = ({ password, hash }) => {
    return bcrypt.compareSync(password, hash);
};

export const generateAccessToken = ({ user_id }) => {
    const token = jwt.sign({ user_id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
    return token;
};

export const generateRefreshToken = ({ user_id, email }) => {
    const token = jwt.sign(
        { user_id, email },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "30d",
        }
    );
    return token;
};

export const verifyAccessToken = (token) => {
    const { user_id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return user_id;
};

export const verifyRefreshToken = ({ token }) => {
    const { user_id, email } = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
    );
    return { user_id, email };
};
