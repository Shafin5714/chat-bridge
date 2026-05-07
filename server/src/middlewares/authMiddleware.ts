import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "./asyncHandler";
import User, { IUser } from "../models/userModel";
import logger from "../utils/logger";

interface JwtPayload {
  userId: string;
}

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      req.user = (await User.findById(decoded.userId).select("-password")) as IUser;

      next();
    } catch (error: any) {
      logger.error("Auth token verification failed:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };
