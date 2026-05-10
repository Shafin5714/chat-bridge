import { Router } from "express";
import { logout, login, register } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimiter";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema, loginSchema } from "../validators";

const router = Router();

router.route("/register").post(authLimiter, validateRequest(registerSchema), register);
router.route("/login").post(authLimiter, validateRequest(loginSchema), login);
router.route("/logout").post(logout);

export default router;
