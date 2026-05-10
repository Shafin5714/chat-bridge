import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler";
import generateTokens from "../utils/generateToken";
import User, { IUser } from "../models/userModel";

// @route   POST /api/auth/register
// @desc    Register a new user and return token + user info
// @access  Public
// @returns { success, message, data: { user:{id, name, email} } }
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    await generateTokens(res, (user._id as mongoose.Types.ObjectId).toString());
    res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// @returns { success, message, data: { user:{id, name, email} } }
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    await generateTokens(res, (user._id as mongoose.Types.ObjectId).toString());
    res.json({
      success: true,
      message: "Login successful.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookies and revoke refresh token
// @access  Public
// @returns { success, message }
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Attempt to clear the refresh token from the DB
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET as string
      ) as { userId: string };
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
    } catch {
      // Token may be expired/invalid, that's fine — just clear the cookies
    }
  }

  // Clear both cookies
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @route   POST /api/auth/refresh
// @desc    Use refresh token to issue a new access token (full rotation)
// @access  Public
// @returns { success: true }
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      res.status(401);
      throw new Error("No refresh token");
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET as string
      ) as { userId: string };
    } catch {
      res.status(401);
      throw new Error("Refresh token expired or invalid");
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken) {
      res.status(401);
      throw new Error("Refresh token revoked");
    }

    // Compare the incoming token with the stored hash
    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) {
      // Possible token reuse — revoke all tokens for safety
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      res.status(401);
      throw new Error("Refresh token reuse detected");
    }

    // Full rotation: issue new access + refresh tokens
    await generateTokens(res, decoded.userId);

    res.json({ success: true });
  }
);
