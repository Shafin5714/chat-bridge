import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import Conversation from "../models/conversationModel";
import User from "../models/userModel";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const getReceiverSocketId = (userId: string): string | undefined => {
  return userSocketMap[userId];
};

const userSocketMap: { [key: string]: string } = {}; // {userId:socketId}

interface CustomSocket extends Socket {
  userId?: string;
}

// Socket Authentication Middleware
io.use((socket: CustomSocket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Authentication error: No cookies"));
    }

    const tokenMatch = cookieHeader.match(/jwt=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return next(new Error("Authentication error: No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    socket.userId = decoded.userId;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Socket authentication failed:", message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket: CustomSocket) => {
  logger.debug("User connected:", socket.id);

  const userId = socket.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Join all conversation rooms the user belongs to
  try {
    const conversations = await Conversation.find({ members: userId }).select("_id").lean<{ _id: mongoose.Types.ObjectId }[]>();
    for (const c of conversations) {
      socket.join(c._id.toString());
    }
    if (userId) {
      logger.debug(`User ${userId} joined ${conversations.length} conversation rooms`);
    }
  } catch (err) {
    logger.debug("Error joining conversation rooms:", err);
  }

  // Send online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join a new conversation room (when added to group or DM created)
  socket.on("joinConversation", (conversationId: string) => {
    socket.join(conversationId);
    logger.debug(`User ${userId} joined room ${conversationId}`);
  });

  // Typing message — broadcast to conversation room
  socket.on("typingMessage", (data: { senderId: string; conversationId: string; isTyping: boolean }) => {
    socket.to(data.conversationId).emit("typingMessageGet", {
      senderId: data.senderId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  });

  socket.on("disconnect", async () => {
    logger.debug("User disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (err) {
        logger.error("Failed to update lastSeen on disconnect", err);
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
