import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/messageModel.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import { getUsersWithLastMessage } from "../services/userService.js";

// @route   GET /api/message/users
// @desc    Get all users except the logged in user with last message
// @access  Private
// @returns { success, data: {_id, email, name, profilePic, createdAt, updatedAt, lastMessage, lastMessageTime, unreadCount}[]}
export const getUsers = asyncHandler(async (req, res) => {
  const loggedInUser = req.user._id;
  const usersWithLastMessage = await getUsersWithLastMessage(loggedInUser);

  res.status(200).json({
    success: true,
    data: usersWithLastMessage,
  });
});

// @route   POST /api/message/send/:id
// @desc    Send message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { text, image } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  let imageUrl;
  if (image) {
    // Upload base64 image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "chat-bridge",
    });
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
    read: false,
  });

  await newMessage.save();

  // Emit new message to receiver
  const receiveSocketId = getReceiverSocketId(receiverId);
  if (receiveSocketId) {
    io.to(receiveSocketId).emit("newMessage", newMessage);
  }

  // Emit updated user lists to both sender and receiver
  const senderSocketId = getReceiverSocketId(senderId);
  const receiverSocketId = getReceiverSocketId(receiverId);

  // Get updated user data for sender
  const senderUsersWithLastMessage = await getUsersWithLastMessage(senderId);

  // Get updated user data for receiver
  const receiverUsersWithLastMessage = await getUsersWithLastMessage(receiverId);

  // Emit updated user lists
  if (senderSocketId) {
    io.to(senderSocketId).emit("updatedUsers", senderUsersWithLastMessage);
  }
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("updatedUsers", receiverUsersWithLastMessage);
  }

  res.status(201).json({
    success: true,
    data: newMessage,
  });
});

// @route   GET /api/message/:id
// @desc    Get user messages
// @access  Private
export const getMessages = async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: messages,
  });
};

// @route   PUT /api/message/read/:id
// @desc    Mark all messages from a user as read
// @access  Private
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { id: userId } = req.params; // sender id (person we're reading messages FROM)
  const myId = req.user._id; // receiver id (me, the person marking as read)

  // Mark messages as read
  await Message.updateMany(
    { senderId: userId, receiverId: myId, read: false },
    { read: true }
  );

  // Update the SENDER's view (User B sees their messages are now read)
  const senderSocketId = getReceiverSocketId(userId);
  if (senderSocketId) {
    const senderUsersWithLastMessage = await getUsersWithLastMessage(userId);
    io.to(senderSocketId).emit("updatedUsers", senderUsersWithLastMessage);
    
    // Emit event to let the sender know their messages were read
    io.to(senderSocketId).emit("messagesRead", {
      receiverId: myId,
    });
  }

  // Update the CURRENT USER's view (User A sees updated unread counts)
  const mySocketId = getReceiverSocketId(myId);
  if (mySocketId) {
    const myUsersWithLastMessage = await getUsersWithLastMessage(myId);
    io.to(mySocketId).emit("updatedUsers", myUsersWithLastMessage);
  }

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
  });
});
