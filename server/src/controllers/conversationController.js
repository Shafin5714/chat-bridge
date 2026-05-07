import asyncHandler from "../middlewares/asyncHandler.js";
import Conversation from "../models/conversationModel.js";
import cloudinary from "../lib/cloudinary.js";
import {
  getOrCreateDMConversation,
  isMember,
  isAdmin,
} from "../services/conversationService.js";

// @route   GET /api/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  const conversations = await Conversation.find({ members: myId })
    .populate("members", "-password")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: conversations,
  });
});

// @route   POST /api/conversations/dm
// @desc    Get or create a DM conversation with another user
// @access  Private
export const getOrCreateDM = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }

  if (userId === myId.toString()) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot create DM with yourself" });
  }

  const conversation = await getOrCreateDMConversation(myId, userId);
  const populated = await conversation.populate("members", "-password");

  res.status(200).json({
    success: true,
    data: populated,
  });
});

// @route   POST /api/conversations/group
// @desc    Create a new group conversation
// @access  Private
export const createGroup = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const { name, memberIds, avatar } = req.body;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Group name is required" });
  }

  if (!memberIds || memberIds.length < 1) {
    return res
      .status(400)
      .json({ success: false, message: "At least 1 other member is required" });
  }

  if (memberIds.length > 49) {
    return res
      .status(400)
      .json({ success: false, message: "Max 50 members allowed" });
  }

  let avatarUrl = null;
  if (avatar) {
    const uploadResponse = await cloudinary.uploader.upload(avatar, {
      folder: "chat-bridge-groups",
    });
    avatarUrl = uploadResponse.secure_url;
  }

  // Ensure creator is included in members
  const allMembers = [myId, ...memberIds.filter((id) => id !== myId.toString())];

  const conversation = await Conversation.create({
    type: "group",
    name: name.trim(),
    avatar: avatarUrl,
    admin: myId,
    members: allMembers,
  });

  const populated = await conversation.populate("members", "-password");

  res.status(201).json({
    success: true,
    data: populated,
  });
});

// @route   PUT /api/conversations/group/:id
// @desc    Update group name/avatar (admin only)
// @access  Private
export const updateGroup = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const { id } = req.params;
  const { name, avatar } = req.body;

  const conversation = await Conversation.findById(id);
  if (!conversation || conversation.type !== "group") {
    return res
      .status(404)
      .json({ success: false, message: "Group not found" });
  }

  if (!isAdmin(conversation, myId)) {
    return res
      .status(403)
      .json({ success: false, message: "Only the admin can update the group" });
  }

  if (name) conversation.name = name.trim();

  if (avatar) {
    const uploadResponse = await cloudinary.uploader.upload(avatar, {
      folder: "chat-bridge-groups",
    });
    conversation.avatar = uploadResponse.secure_url;
  }

  await conversation.save();
  const populated = await conversation.populate("members", "-password");

  res.status(200).json({
    success: true,
    data: populated,
  });
});

// @route   PUT /api/conversations/group/:id/members
// @desc    Add members to group (admin only)
// @access  Private
export const addMembers = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const { id } = req.params;
  const { memberIds } = req.body;

  const conversation = await Conversation.findById(id);
  if (!conversation || conversation.type !== "group") {
    return res
      .status(404)
      .json({ success: false, message: "Group not found" });
  }

  if (!isAdmin(conversation, myId)) {
    return res
      .status(403)
      .json({ success: false, message: "Only the admin can add members" });
  }

  const currentMembers = conversation.members.map((m) => m.toString());
  const newMembers = memberIds.filter((id) => !currentMembers.includes(id));

  if (currentMembers.length + newMembers.length > 50) {
    return res
      .status(400)
      .json({ success: false, message: "Max 50 members allowed" });
  }

  conversation.members.push(...newMembers);
  await conversation.save();
  const populated = await conversation.populate("members", "-password");

  res.status(200).json({
    success: true,
    data: populated,
  });
});

// @route   DELETE /api/conversations/group/:id/members/:userId
// @desc    Remove a member from group (admin only)
// @access  Private
export const removeMember = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const { id, userId } = req.params;

  const conversation = await Conversation.findById(id);
  if (!conversation || conversation.type !== "group") {
    return res
      .status(404)
      .json({ success: false, message: "Group not found" });
  }

  if (!isAdmin(conversation, myId)) {
    return res
      .status(403)
      .json({ success: false, message: "Only the admin can remove members" });
  }

  if (userId === myId.toString()) {
    return res
      .status(400)
      .json({ success: false, message: "Admin cannot remove themselves. Use leave instead." });
  }

  conversation.members = conversation.members.filter(
    (m) => m.toString() !== userId
  );
  await conversation.save();
  const populated = await conversation.populate("members", "-password");

  res.status(200).json({
    success: true,
    data: populated,
  });
});

// @route   POST /api/conversations/group/:id/leave
// @desc    Leave a group conversation
// @access  Private
export const leaveGroup = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const { id } = req.params;

  const conversation = await Conversation.findById(id);
  if (!conversation || conversation.type !== "group") {
    return res
      .status(404)
      .json({ success: false, message: "Group not found" });
  }

  if (!isMember(conversation, myId)) {
    return res
      .status(400)
      .json({ success: false, message: "You are not a member of this group" });
  }

  conversation.members = conversation.members.filter(
    (m) => m.toString() !== myId.toString()
  );

  // If admin leaves, transfer to the first remaining member
  if (isAdmin(conversation, myId) && conversation.members.length > 0) {
    conversation.admin = conversation.members[0];
  }

  // If no members left, delete the conversation
  if (conversation.members.length === 0) {
    await Conversation.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Group deleted (no members remaining)",
    });
  }

  await conversation.save();

  res.status(200).json({
    success: true,
    message: "Left the group",
  });
});
