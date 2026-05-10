import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text?: string;
  image?: string;
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    attachment: {
      type: new Schema(
        {
          url: { type: String, required: true },
          name: { type: String, required: true },
          type: { type: String, required: true },
          size: { type: Number, required: true },
        },
        { _id: false }
      ),
      default: undefined,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1 });
messageSchema.index({ text: "text" });

const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
