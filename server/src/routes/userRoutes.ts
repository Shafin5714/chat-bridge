import { Router } from "express";
import { updateProfile, getAllUsers } from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", protect, getAllUsers);
router.put("/profile", protect, updateProfile);

export default router;
