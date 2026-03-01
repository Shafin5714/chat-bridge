import { Router } from "express";
import authRoute from "./authRoutes.js";
import messageRoute from "./messageRoutes.js";
import userRoute from "./userRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).send("Api running.");
});

router.use("/api/auth", authRoute);
router.use("/api/message", messageRoute);
router.use("/api/users", userRoute);

export default router;
