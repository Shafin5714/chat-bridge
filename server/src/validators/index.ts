import { z } from "zod";
import xss from "xss";

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").transform(val => xss(val)),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

// User Schemas
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").transform(val => xss(val)).nullish(),
    profilePic: z.string().nullish(),
  }).refine(data => (data.name !== undefined && data.name !== null) || (data.profilePic !== undefined && data.profilePic !== null), {
    message: "Provide name or profilePic to update",
    path: ["name"],
  }),
});

// Message Schemas
export const sendMessageSchema = z.object({
  params: z.object({
    conversationId: z.string(),
  }),
  body: z.object({
    text: z.string().nullish().transform(val => val ? xss(val) : val),
    image: z.string().nullish(),
    attachment: z.object({
      data: z.string(),
      name: z.string(),
      type: z.string(),
      size: z.number(),
    }).nullish(),
  }).refine(data => (data.text && data.text.trim().length > 0) || (data.image && data.image.length > 0) || !!data.attachment, {
    message: "Message must contain text, an image, or an attachment",
    path: ["text"],
  }),
});

// Conversation Schemas
export const dmConversationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
});

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Group name is required").max(100, "Group name too long").transform(val => xss(val)),
    memberIds: z.array(z.string()).min(1, "At least 1 other member is required").max(49, "Max 50 members allowed"),
    avatar: z.string().nullish(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1, "Group name is required").max(100, "Group name too long").transform(val => xss(val)).nullish(),
    avatar: z.string().nullish(),
  }).refine(data => (data.name !== undefined && data.name !== null) || (data.avatar !== undefined && data.avatar !== null), {
    message: "Provide name or avatar to update",
    path: ["name"],
  }),
});

export const groupMembersSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    memberIds: z.array(z.string()).min(1, "At least 1 member is required"),
  }),
});
