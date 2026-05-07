import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConversation extends Document {
  type: "dm" | "group";
  name?: string | null;
  avatar?: string | null;
  admin?: mongoose.Types.ObjectId | null;
  members: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ["dm", "group"],
      default: "dm",
    },
    name: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
conversationSchema.index({ members: 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);

export default Conversation;
