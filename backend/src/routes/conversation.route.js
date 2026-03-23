import { Router } from "express";
import {
  createConversation,
  getConversations,
  deleteConversation,
  startConversation,
} from "../controllers/conversation.controller.js";

const router = Router();

router.get("/", getConversations);
router.post("/start", startConversation);
router.post("/", createConversation);
router.delete("/:id", deleteConversation);

export default router;
