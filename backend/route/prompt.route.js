import express from "express";
import { sendPromt } from "../controller/prompt.controller.js";
import userMiddleware from "../middleware/prompt.middleware.js";

const router = express.Router();

router.post("/promt", userMiddleware, sendPromt);

export default router;