import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { router } from "./routes/index.js";
import { socketConnect } from "./socket/socket.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { client } from "./db/db.config.js";

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
app.get("/", async (req, res) => {
    const time = await client.query(`
        select current_timestamp;
    `);
    const date = new Date(time.rows[0].current_timestamp);
    res.json({
        date,
        timestamp: time.rows[0].current_timestamp,
        hours: date.getHours,
    });
});

const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

socketConnect(server);
