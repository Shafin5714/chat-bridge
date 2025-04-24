import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";

export const getUsers = asyncHandler(async (req, res) => {
  const loggedInUser = req.user._id;

  const filteredUsers = await User.find({
    _id: { $ne: loggedInUser },
  }).select("-password");

  res.status(200).json({
    success: true,
    data: filteredUsers,
  });
});
