import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
// @returns { success, message, data: { user:{id, name, email, profilePic} } }
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, profilePic } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update name if provided
  if (name) {
    user.name = name;
  }

  // Update profile picture if provided
  if (profilePic) {
    try {
      // Upload to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "chat-bridge",
      });
      user.profilePic = uploadResponse.secure_url;
    } catch (error) {
      res.status(400);
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    },
  });
});
