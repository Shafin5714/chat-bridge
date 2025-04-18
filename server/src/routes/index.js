import { Router } from "express";
import authRoute from "./authRoute.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).send("Api running.");
});

router.use("/api/auth", authRoute);

export default router;
