import Conversation from "../models/conversationModel.js";

/**
 * Find an existing DM conversation between two users, or create one.
 */
export async function getOrCreateDMConversation(userA, userB) {
  let conversation = await Conversation.findOne({
    type: "dm",
    members: { $all: [userA, userB], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: "dm",
      members: [userA, userB],
    });
  }

  return conversation;
}

/**
 * Verify that a user is a member of a conversation.
 */
export function isMember(conversation, userId) {
  return conversation.members.some(
    (m) => m.toString() === userId.toString()
  );
}

/**
 * Verify that a user is the admin of a group conversation.
 */
export function isAdmin(conversation, userId) {
  return (
    conversation.admin &&
    conversation.admin.toString() === userId.toString()
  );
}
