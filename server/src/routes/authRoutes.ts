import { Router } from "express";
import { logout, login, register } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.route("/register").post(authLimiter, register);
router.route("/login").post(authLimiter, login);
router.route("/logout").post(logout);

export default router;
