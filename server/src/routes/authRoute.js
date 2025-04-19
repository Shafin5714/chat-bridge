import { Router } from "express";
import { logout, login, register } from "../controllers/authController.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router;
