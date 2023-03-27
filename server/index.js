import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { router } from "./routes/index.js";
import { websocketConnect } from "./websocket/socket.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({
    path: `${process.cwd()}/.env.server`,
});
const app = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", `${process.cwd()}/public`);
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use("/api", router);
app.get("/", (req, res) => {
    res.send("Hello World");
});

const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

websocketConnect(server);
