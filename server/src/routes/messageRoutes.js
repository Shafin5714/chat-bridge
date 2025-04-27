import { Router } from "express";
import {
  getUsers,
  sendMessage,
  getMessages,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/users").get(protect, getUsers);
router.route("/send/:id").post(protect, sendMessage);
router.route("/:id").get(protect, getMessages);

export default router;
