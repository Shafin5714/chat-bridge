import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

const userSocketMap = {}; // {userId:socketId}

// Socket Authentication Middleware
io.use((socket, next) => {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    logger.error("Socket authentication failed:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  logger.debug("User connected:", socket.id);

  const userId = socket.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Join all conversation rooms the user belongs to
  try {
    const conversations = await Conversation.find({ members: userId }).select(
      "_id"
    );
    conversations.forEach((c) => socket.join(c._id.toString()));
    logger.debug(`User ${userId} joined ${conversations.length} conversation rooms`);
  } catch (err) {
    logger.debug("Error joining conversation rooms:", err);
  }

  // Send online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join a new conversation room (when added to group or DM created)
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    logger.debug(`User ${userId} joined room ${conversationId}`);
  });

  // Typing message — broadcast to conversation room
  socket.on("typingMessage", (data) => {
    socket.to(data.conversationId).emit("typingMessageGet", {
      senderId: data.senderId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  });

  socket.on("disconnect", () => {
    logger.debug("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
