import { Router } from "express";
import { getUsers } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/users").get(protect, getUsers);

export default router;
