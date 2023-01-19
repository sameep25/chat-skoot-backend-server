import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
  deleteGroup
} from "../controller/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/", protect, accessChat);
chatRouter.get("/all", protect, fetchChat);
chatRouter.post("/group/new", protect, createGroupChat);
chatRouter.put("/group/rename", protect, renameGroupChat);
chatRouter.put("/group/add", protect, addToGroup);
chatRouter.put("/group/remove",protect ,removeFromGroup) ;
chatRouter.delete("/group/delete/:id",protect ,deleteGroup) ;

export default chatRouter;
