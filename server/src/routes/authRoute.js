import { Router } from "express";
import { registerUser } from "../controllers/authController.js";

const router = Router();

router.route("/register").post(registerUser);
