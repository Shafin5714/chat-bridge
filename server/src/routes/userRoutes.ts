import { Router } from "express";
import { updateProfile, getAllUsers } from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { updateProfileSchema } from "../validators";

const router = Router();

router.get("/", protect, getAllUsers);
router.put("/profile", protect, validateRequest(updateProfileSchema), updateProfile);

export default router;
