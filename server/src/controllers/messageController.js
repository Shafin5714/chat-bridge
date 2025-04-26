import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/messageModel.js";

// @route   GET /api/message/users
// @desc    Get all users except the logged in user
// @access  Private
// @returns { success, data: {_id, email, name, profilePic, createdAt, updatedAt}[]}
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

// @route   POST /api/message/send/:id
// @desc    Get user messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { text, image } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  let imageUrl;
  if (image) {
    // Upload base64 image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  await newMessage.save();

  res.status(201).json({
    success: true,
    data: newMessage,
  });
});
