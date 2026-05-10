import { Request, Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import asyncHandler from "../middlewares/asyncHandler";
import cloudinary from "../lib/cloudinary";
import Message from "../models/messageModel";
import Conversation from "../models/conversationModel";
import { io } from "../lib/socket";

// @route   POST /api/message/send/:conversationId
// @desc    Send message to a conversation
// @access  Private
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { text, image, attachment } = req.body;
  const { conversationId } = req.params;
  const senderId = req.user?._id;

  if (!senderId) return res.status(401).json({ success: false, message: "Unauthorized" });

  // Verify conversation exists and user is a member
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  const isMember = conversation.members.some(
    (m) => m.toString() === senderId.toString()
  );
  if (!isMember) {
    return res.status(403).json({ success: false, message: "Not a member of this conversation" });
  }

  let imageUrl;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "chat-bridge",
    });
    imageUrl = uploadResponse.secure_url;
  }

  let attachmentData;
  if (attachment && attachment.data) {
    // Determine the correct Cloudinary resource_type from the MIME type
    let resourceType: "image" | "video" | "raw" | "auto" = "raw";
    if (attachment.type.startsWith("image")) resourceType = "image";
    else if (attachment.type.startsWith("video") || attachment.type.startsWith("audio")) resourceType = "video";

    const uploadResponse = await cloudinary.uploader.upload(attachment.data, {
      folder: "chat-bridge/attachments",
      resource_type: resourceType,
    });
    attachmentData = {
      url: uploadResponse.secure_url,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
    };
  }

  const newMessage = new Message({
    conversationId,
    senderId,
    text,
    image: imageUrl,
    attachment: attachmentData,
  });

  await newMessage.save();

  // Update conversation's lastMessage and bump updatedAt
  conversation.lastMessage = newMessage._id as mongoose.Types.ObjectId;
  await conversation.save();

  // Populate sender info for the emitted message
  const populatedMessage = await Message.findById(newMessage._id).populate(
    "senderId",
    "name profilePic"
  );

  // Emit to the conversation room (all members)
  io.to(conversationId).emit("newMessage", populatedMessage);

  // Emit updated conversation to all members
  const updatedConversation = await Conversation.findById(conversationId)
    .populate("members", "-password")
    .populate("lastMessage");
  io.to(conversationId).emit("conversationUpdated", updatedConversation);

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

// @route   GET /api/message/:conversationId
// @desc    Get messages for a conversation
// @access  Private
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const myId = req.user?._id;
  const { cursor, newerCursor, around, limit: rawLimit } = req.query;

  if (!myId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const limit = Math.min(parseInt(rawLimit as string) || 30, 50);

  // Verify membership
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  const memberCheck = conversation.members.some(
    (m) => m.toString() === myId.toString()
  );
  if (!memberCheck) {
    return res.status(403).json({ success: false, message: "Not a member" });
  }

  const baseFilter = { conversationId };

  if (around) {
    const halfLimit = Math.floor(limit / 2);

    const olderMessages = await Message.find({ ...baseFilter, _id: { $lt: around } })
      .sort({ createdAt: -1 })
      .limit(halfLimit + 1);

    const hasMoreOlder = olderMessages.length > halfLimit;
    if (hasMoreOlder) olderMessages.pop();
    olderMessages.reverse();

    const newerMessages = await Message.find({ ...baseFilter, _id: { $gte: around } })
      .sort({ createdAt: 1 })
      .limit(limit - halfLimit + 1);

    const hasMoreNewer = newerMessages.length > (limit - halfLimit);
    if (hasMoreNewer) newerMessages.pop();

    const messages = [...olderMessages, ...newerMessages];

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        olderCursor: messages.length > 0 ? messages[0]._id : null,
        hasMoreOlder,
        newerCursor: messages.length > 0 ? messages[messages.length - 1]._id : null,
        hasMoreNewer,
        limit,
      },
    });
  }

  if (newerCursor) {
    const messages = await Message.find({ ...baseFilter, _id: { $gt: newerCursor } })
      .sort({ createdAt: 1 })
      .limit(limit + 1);

    const hasMoreNewer = messages.length > limit;
    if (hasMoreNewer) messages.pop();

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        olderCursor: null,
        hasMoreOlder: null,
        newerCursor: messages.length > 0 ? messages[messages.length - 1]._id : null,
        hasMoreNewer,
        limit,
      },
    });
  }

  // Default: fetch older (or initial)
  const filter: FilterQuery<typeof Message> = { ...baseFilter };
  if (cursor) {
    filter._id = { $lt: cursor };
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMoreOlder = messages.length > limit;
  if (hasMoreOlder) messages.pop();

  messages.reverse();

  return res.status(200).json({
    success: true,
    data: messages,
    pagination: {
      olderCursor: messages.length > 0 ? messages[0]._id : null,
      hasMoreOlder,
      newerCursor: messages.length > 0 && !cursor ? messages[messages.length - 1]._id : null,
      hasMoreNewer: false,
      limit,
    },
  });
});

// @route   GET /api/message/search/:conversationId
// @desc    Search messages in a conversation
// @access  Private
export const searchMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ success: false, message: "Search query is required" });
  }

  const messages = await Message.find({
    conversationId,
    $text: { $search: q as string },
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    data: messages,
  });
});
