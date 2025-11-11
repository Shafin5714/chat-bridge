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
    read: false,
  });

  await newMessage.save();

  const receiveSocketId = getReceiverSocketId(receiverId);
  if (receiveSocketId) {
    io.to(receiveSocketId).emit("newMessage", newMessage);

    // Send updated user data to receiver to update unread count
    const receiverUser = await User.findById(receiverId).select("-password");
    const otherUsersForReceiver = await User.find({
      _id: { $ne: receiverId },
    }).select("-password");

    const otherUsersWithLastMessageForReceiver = await Promise.all(
      otherUsersForReceiver.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: receiverId, receiverId: user._id },
            { senderId: user._id, receiverId: receiverId },
          ],
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: receiverId,
          read: senderId === receiverId ? true : false,
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

    // Add the sender to the receiver's user list with unread count
    const senderLastMessage = await Message.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: -1 });

    const senderUnreadCount = await Message.countDocuments({
      senderId: senderId,
      receiverId: receiverId,
      read: false,
    });

    const senderData = {
      ...receiverUser.toObject(),
      lastMessage: senderLastMessage
        ? {
            text: senderLastMessage.text,
            image: senderLastMessage.image,
            senderId: senderLastMessage.senderId,
          }
        : null,
      lastMessageTime: senderLastMessage ? senderLastMessage.createdAt : null,
      unreadCount: senderUnreadCount,
    };

    otherUsersWithLastMessageForReceiver.push(senderData);

    io.to(receiveSocketId).emit(
      "updatedUsers",
      otherUsersWithLastMessageForReceiver
    );
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
// @desc    Get user messages and mark them as read
// @access  Private
export const getMessages = async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  // Mark messages from the other user as read
  await Message.updateMany(
    { senderId: userToChatId, receiverId: myId, read: false },
    { read: true }
  );

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

  // 1. Update the SENDER's view (User B sees their unread count decrease)
  const senderSocketId = getReceiverSocketId(userId);
  if (senderSocketId) {
    const otherUsers = await User.find({
      _id: { $ne: userId },
    }).select("-password");

    const otherUsersWithLastMessage = await Promise.all(
      otherUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: user._id },
            { senderId: user._id, receiverId: userId },
          ],
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
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

    io.to(senderSocketId).emit("updatedUsers", otherUsersWithLastMessage);
  }

  // 2. Update the CURRENT USER's view (User A sees read status updated)
  const mySocketId = getReceiverSocketId(myId);
  if (mySocketId) {
    const myOtherUsers = await User.find({
      _id: { $ne: myId },
    }).select("-password");

    const myOtherUsersWithLastMessage = await Promise.all(
      myOtherUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: myId, receiverId: user._id },
            { senderId: user._id, receiverId: myId },
          ],
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: myId,
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

    io.to(mySocketId).emit("updatedUsers", myOtherUsersWithLastMessage);
  }

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
  });
});
