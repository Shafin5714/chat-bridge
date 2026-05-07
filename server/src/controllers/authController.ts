import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import generateToken from "../utils/generateToken";
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
    generateToken(res, (user as any)._id.toString());
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
    generateToken(res, (user as any)._id.toString());
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
// @desc    Logout user / clear cookie
// @access  Public
// @returns {  message }
export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
