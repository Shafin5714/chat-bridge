import { Router } from "express";
import { getUsers, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/users").get(protect, getUsers);
router.route("/send/:id").get(protect, sendMessage);

export default router;
