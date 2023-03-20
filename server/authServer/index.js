import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { authRouter } from "./api/auth.js";
import { googleRouter } from "./api/google.js";
import { facebookRouter } from "./api/facebook.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({
    path: `${process.cwd()}/.env.global`,
});
const app = express();
const port = process.env.AUTH_PORT || 8081;
const client_url = process.env.CLIENT_URL;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    cors({
        origin: client_url,
        credentials: true,
    })
);
app.use(cookieParser());

app.use("/auth/google", googleRouter);
app.use("/auth/facebook", facebookRouter);
app.use("/auth", authRouter);
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
