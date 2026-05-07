import { Router } from "express";
import { updateProfile, getAllUsers } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, getAllUsers);
router.put("/profile", protect, updateProfile);

export default router;
