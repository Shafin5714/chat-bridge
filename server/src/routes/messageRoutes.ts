import { Router } from "express";
import {
  sendMessage,
  getMessages,
  searchMessages,
} from "../controllers/messageController";
import { protect } from "../middlewares/authMiddleware";
import { messageLimiter } from "../middlewares/rateLimiter";
import { validateRequest } from "../middlewares/validateRequest";
import { sendMessageSchema } from "../validators";

const router = Router();

router.route("/send/:conversationId").post(protect, messageLimiter, validateRequest(sendMessageSchema), sendMessage);
router.route("/search/:conversationId").get(protect, searchMessages);
router.route("/:conversationId").get(protect, getMessages);

export default router;
