import mongoose from "mongoose";
import Conversation, { IConversation } from "../models/conversationModel";

/**
 * Find an existing DM conversation between two users, or create one.
 */
export async function getOrCreateDMConversation(
  userA: string | mongoose.Types.ObjectId,
  userB: string | mongoose.Types.ObjectId
): Promise<IConversation> {
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
export function isMember(conversation: IConversation, userId: string | mongoose.Types.ObjectId): boolean {
  return conversation.members.some((m) => m.toString() === userId.toString());
}

/**
 * Verify that a user is the admin of a group conversation.
 */
export function isAdmin(conversation: IConversation, userId: string | mongoose.Types.ObjectId): boolean {
  return (
    !!conversation.admin && conversation.admin.toString() === userId.toString()
  );
}
