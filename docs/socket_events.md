# 🔌 WebSocket Events Reference

Chat Bridge relies heavily on `Socket.io` for real-time capabilities. This document outlines the lifecycle and payload structures for all socket events.

## 🔒 Authentication

All socket connections require a valid JWT token in the HTTP-only cookie during the initial handshake.
The connection first checks for the short-lived `jwt` access token, and if expired, falls back to the `refreshToken`.

```javascript
// Handshake is rejected if both tokens are missing or invalid
const socket = io({
  withCredentials: true // Required to send cookies
});
```

---

## 📡 Server Emits (Client Listens)

These are events the server broadcasts to connected clients.

### `getOnlineUsers`
Emitted whenever a user connects or disconnects. Used to update the active status indicators across the app.
- **Payload:** `string[]` (Array of active `userId`s)

### `newMessage`
Emitted to a specific conversation room when a new message is successfully saved to the database.
- **Payload:** `IMessage` (Populated with sender details like name and profilePic)

### `conversationUpdated`
Emitted to a conversation room when conversation metadata changes (e.g., last message updated, members added/removed).
- **Payload:** `IConversation` (Populated with member details)

### `typingMessageGet`
Emitted to a conversation room when a member is actively typing.
- **Payload:** 
  ```ts
  {
    senderId: string;
    conversationId: string;
    isTyping: boolean;
  }
  ```

---

## 🎧 Server Listens (Client Emits)

These are events the client must emit to trigger real-time server actions.

### `joinConversation`
Client emits this when opening a chat window to join the specific Socket room for that conversation.
- **Payload:** `string` (The `conversationId`)

### `typingMessage`
Client emits this continuously while the user is typing in the input field.
- **Payload:**
  ```ts
  {
    senderId: string;
    conversationId: string;
    isTyping: boolean;
  }
  ```

---

## 🏗 Room Architecture

- **Global Rooms:** Users do not join a global "online" room. Global presence is managed via a `userSocketMap` in server memory.
- **Conversation Rooms:** When a user connects, the server automatically joins their socket to the `_id` of every `Conversation` they are a member of. This allows the server to broadcast `newMessage` directly to `io.to(conversationId)` without manually finding each member's socket ID.
