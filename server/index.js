import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { router } from "./routes/index.js";
import { websocketConnect } from "./websocket/socket.js";

dotenv.config({
    path: `${process.cwd()}/.env.server`,
});
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", `${process.cwd()}/public`);

app.use("/api", router);
app.get("/", (req, res) => {
    res.send("Hello World");
});

const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

websocketConnect(server);
