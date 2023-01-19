import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {sendMessage ,getMessages} from "../controller/messageController.js" ;

const messageRouter = express.Router();

messageRouter.post("/send" ,protect ,sendMessage) ;
messageRouter.get("/get/:chatId",protect ,getMessages) ;

export default messageRouter;