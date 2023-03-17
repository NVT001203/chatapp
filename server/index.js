import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config({
    path: `${process.cwd()}/.env.server`,
});
const app = express();
const port = process.env.PORT;

app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", `${process.cwd()}/public`);
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
