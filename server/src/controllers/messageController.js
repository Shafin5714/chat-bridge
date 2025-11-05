import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/messageModel.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// @route   GET /api/message/users
// @desc    Get all users except the logged in user with last message
// @access  Private
// @returns { success, data: {_id, email, name, profilePic, createdAt, updatedAt, lastMessage, lastMessageTime, unreadCount}[]}
export const getUsers = asyncHandler(async (req, res) => {
  const loggedInUser = req.user._id;

  const filteredUsers = await User.find({
    _id: { $ne: loggedInUser },
  }).select("-password");

  // Get last message for each user
  const usersWithLastMessage = await Promise.all(
    filteredUsers.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: loggedInUser, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUser },
        ],
      }).sort({ createdAt: -1 });

      // Count unread messages (messages from other user that haven't been read)
      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: loggedInUser,
        read: false,
      });

      return {
        ...user.toObject(),
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              image: lastMessage.image,
              senderId: lastMessage.senderId,
            }
          : null,
        lastMessageTime: lastMessage ? lastMessage.createdAt : null,
        unreadCount,
      };
    })
  );

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
    read: true, // Mark as read when sent by the sender
  });

  await newMessage.save();

  const receiveSocketId = getReceiverSocketId(receiverId);
  if (receiveSocketId) {
    io.to(receiveSocketId).emit("newMessage", newMessage);
  }

  // Emit updated user data to both sender and receiver
  const senderSocketId = getReceiverSocketId(senderId);
  const receiverSocketId = getReceiverSocketId(receiverId);

  // Get updated user data for sender
  const senderUsers = await User.find({
    _id: { $ne: senderId },
  }).select("-password");

  const senderUsersWithLastMessage = await Promise.all(
    senderUsers.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: senderId, receiverId: user._id },
          { senderId: user._id, receiverId: senderId },
        ],
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: senderId,
        read: false,
      });

      return {
        ...user.toObject(),
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              image: lastMessage.image,
              senderId: lastMessage.senderId,
            }
          : null,
        lastMessageTime: lastMessage ? lastMessage.createdAt : null,
        unreadCount,
      };
    })
  );

  // Get updated user data for receiver
  const receiverUsers = await User.find({
    _id: { $ne: receiverId },
  }).select("-password");

  const receiverUsersWithLastMessage = await Promise.all(
    receiverUsers.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: receiverId, receiverId: user._id },
          { senderId: user._id, receiverId: receiverId },
        ],
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: receiverId,
        read: false,
      });

      return {
        ...user.toObject(),
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              image: lastMessage.image,
              senderId: lastMessage.senderId,
            }
          : null,
        lastMessageTime: lastMessage ? lastMessage.createdAt : null,
        unreadCount,
      };
    })
  );

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
  });

  res.status(200).json({
    success: true,
    data: messages,
  });
};
