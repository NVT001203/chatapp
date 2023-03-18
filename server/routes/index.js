import { Router } from "express";
import { userRouter } from "./user.js";
import { chatRouter } from "./chat.js";
import { messageRouter } from "./message.js";
import { auth } from "./auth.js";

export const router = Router();

router.use("/user", auth, userRouter);
router.use("/chat", auth, chatRouter);
router.use("/message", auth, messageRouter);
