import { Router } from "express";
import {
  sendMessage,
  getMessages,
  searchMessages,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/send/:conversationId").post(protect, sendMessage);
router.route("/search/:conversationId").get(protect, searchMessages);
router.route("/:conversationId").get(protect, getMessages);

export default router;
