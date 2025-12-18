import User from "../models/userModel.js";
import Message from "../models/messageModel.js";

/**
 * Get all users except the specified user, with last message and unread count.
 * This centralizes the repeated aggregation logic from messageController.
 *
 * @param {string} excludeUserId - The user ID to exclude from the list
 * @returns {Promise<Array>} - Users with lastMessage, lastMessageTime, and unreadCount
 */
export async function getUsersWithLastMessage(excludeUserId) {
  const users = await User.find({ _id: { $ne: excludeUserId } }).select(
    "-password"
  );

  return Promise.all(
    users.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: excludeUserId, receiverId: user._id },
          { senderId: user._id, receiverId: excludeUserId },
        ],
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: excludeUserId,
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
        lastMessageTime: lastMessage?.createdAt || null,
        unreadCount,
      };
    })
  );
}
