import { Router } from "express";
import conversationRoutes from "./conversation.route.js";
import messageRoutes from "./message.route.js";
import uploadRoutes from "./upload.route.js";

const router = Router();

router.use("/conversations", conversationRoutes);
router.use("/conversations/:id/messages", messageRoutes);
router.use("/upload", uploadRoutes);

export default router;
