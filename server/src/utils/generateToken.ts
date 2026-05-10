import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Response } from "express";
import User from "../models/userModel";

/**
 * Generates a short-lived access token and a long-lived refresh token.
 * Sets both as httpOnly cookies and stores the hashed refresh token in the DB.
 */
const generateTokens = async (res: Response, userId: string) => {
  // Short-lived access token (15 minutes)
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });

  // Long-lived refresh token (7 days)
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );

  // Hash the refresh token before storing in DB
  const salt = await bcrypt.genSalt(10);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
  await User.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });

  // Set access token cookie (15 minutes)
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie (7 days)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export default generateTokens;
