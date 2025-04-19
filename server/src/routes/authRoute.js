import { Router } from "express";
import { registerUser, logout } from "../controllers/authController.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/logout").post(logout);

export default router;
