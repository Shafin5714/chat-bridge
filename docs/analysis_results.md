# 💬 Chat Bridge — Feature & Optimization Analysis

After auditing the full codebase (server + client), here's what you currently have and what's missing. Suggestions are grouped by category and ranked by impact.

---

## 📊 Current Feature Inventory

| Area | What's Built |
|---|---|
| **Auth** | Register, login, logout with JWT cookies + bcrypt |
| **Messaging** | 1:1 text + image messages, read receipts, typing indicators |
| **Real-time** | Socket.IO for online presence, new messages, typing, read status |
| **Media** | Cloudinary image upload with client-side compression |
| **UI** | Dark/light theme, emoji picker, responsive layout, profile modal |
| **State** | Redux Toolkit + RTK Query with optimistic updates |

---

## 🔴 High Priority — Features & Fixes

### 1. Message Pagination (Infinite Scroll)

> [!WARNING]
> Currently `getMessages` loads **all messages at once**. This will become a serious performance bottleneck as conversations grow.

**Server:** Add cursor-based pagination to `GET /api/message/:id`
```js
// Example: ?cursor=<lastMessageId>&limit=30
const messages = await Message.find({
  $or: [...],
  ...(cursor ? { _id: { $lt: cursor } } : {})
})
.sort({ createdAt: -1 })
.limit(limit);
```

**Client:** Implement infinite scroll in `chat-body.tsx` using RTK Query's `merge` + `serializeQueryArgs` pattern for paginated queries.

**Complexity:** 🟡 Medium

---

### 2. Message Search

Add the ability to search through conversation history by keyword.

**Server:** New endpoint `GET /api/message/search?q=keyword&userId=<id>` with MongoDB text index on `Message.text`.

**Client:** Search bar in chat header with highlighted results and jump-to-message.

**Complexity:** 🟡 Medium

---

### 3. Group Chat Support

Currently only 1:1 conversations are supported. Group chats are a natural extension:

- New `Conversation` model (members, name, avatar, admin)
- Refactor `Message` to reference `conversationId` instead of `receiverId`
- Group creation/management UI
- Group socket events (typing, read receipts per member)

**Complexity:** 🔴 High — Requires data model redesign

---

### 4. Input Validation & Sanitization

> [!CAUTION]
> No server-side input validation exists. The `register` and `login` controllers accept raw `req.body` without sanitization.

- Add **express-validator** or **Zod** (you already use Zod on the client) for all endpoints
- Sanitize message text to prevent XSS (use `dompurify` or `xss` on server)
- Validate email format, password strength, name length

**Complexity:** 🟢 Low

---

### 5. Rate Limiting

> [!IMPORTANT]
> No rate limiting exists. Your auth endpoints and message sending are vulnerable to brute force and spam.

```bash
npm install express-rate-limit
```

```js
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const messageLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

router.use("/api/auth", authLimiter);
router.use("/api/message/send", messageLimiter);
```

**Complexity:** 🟢 Low

---

## 🟡 Medium Priority — Enhancements

### 6. Message Delete & Edit

Allow users to delete or edit their own sent messages:
- `DELETE /api/message/:messageId` — soft delete with `deleted: true` flag
- `PUT /api/message/:messageId` — edit with `edited: true` + `editedAt` timestamp
- Socket events to sync deletion/edits in real-time
- UI: long-press/right-click context menu on own messages

**Complexity:** 🟡 Medium

---

### 7. File Sharing (Beyond Images)

Currently only images are supported. Extend to support:
- PDFs, documents, audio, video
- File type detection and preview rendering
- File size limits and validation
- Download button for non-image attachments

**Complexity:** 🟡 Medium

---

### 8. Message Reactions (Emoji Reactions)

Let users react to messages with emojis:
- Add `reactions: [{ userId, emoji }]` to Message schema
- Socket event for real-time reaction sync
- Reaction picker UI on hover/long-press

**Complexity:** 🟡 Medium

---

### 9. "Last Seen" Timestamps

Complement online/offline status with a "last seen" timestamp:
- Track `lastSeen: Date` in User model
- Update on socket disconnect
- Display "Last seen 5 minutes ago" when user is offline

**Complexity:** 🟢 Low

---

### 10. Push Notifications (Browser)

Use the **Web Push API** to notify users of new messages when they're not focused on the tab:

```js
// Request permission and show native notifications
if (Notification.permission === "granted") {
  new Notification(`${senderName}`, { body: messageText });
}
```

For a more robust solution, integrate **web-push** on the server for background notifications.

**Complexity:** 🟢 Low (in-tab) / 🟡 Medium (service worker)

---

### 11. User Search & Contact Discovery

Currently the contact list shows **all registered users**. At scale this is unusable:
- Add search/filter on the contacts list
- Server: `GET /api/users/search?q=name` with MongoDB regex or Atlas Search
- Only show users you've chatted with, with a "New Chat" button to discover others

**Complexity:** 🟢 Low

---

## 🔵 Optimizations

### 12. N+1 Query in `getUsersWithLastMessage`

> [!WARNING]
> [userService.js](file:///c:/Users/Shafin_MTL/Documents/Local/chat-bridge/server/src/services/userService.js) runs **2 queries per user** (lastMessage + unreadCount) inside a `Promise.all(users.map(...))`. With 100 users, that's 200+ DB queries.

**Fix:** Use MongoDB aggregation pipeline:
```js
const result = await Message.aggregate([
  { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
  { $sort: { createdAt: -1 } },
  { $group: {
    _id: { $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"] },
    lastMessage: { $first: "$$ROOT" },
    unreadCount: { $sum: { $cond: [
      { $and: [{ $ne: ["$senderId", userId] }, { $eq: ["$read", false] }] }, 1, 0
    ]}}
  }}
]);
```

**Impact:** Reduces DB queries from O(2N) to O(1). **Critical for scalability.**

**Complexity:** 🟡 Medium

---

### 13. Socket Authentication

> [!CAUTION]
> Socket connections are authenticated only by a `userId` query parameter. **Any user can impersonate another** by passing a different userId.

**Fix:** Validate JWT in socket middleware:
```js
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || parseCookies(socket.handshake.headers.cookie);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});
```

**Complexity:** 🟢 Low — **Do this immediately.**

---

### 14. Helmet & Security Headers

Add production-ready security headers:
```bash
npm install helmet
```
```js
import helmet from 'helmet';
app.use(helmet());
```

**Complexity:** 🟢 Low

---

### 15. Graceful Error Handling in `errorMiddleware`

Current error handler doesn't distinguish between:
- Validation errors (400)
- MongoDB duplicate key errors (409)
- Mongoose CastError (400)

Add specific error type handling for more informative API responses.

**Complexity:** 🟢 Low

---

### 16. JWT Refresh Token Flow

> [!IMPORTANT]
> Current JWT expires in 30 days with no refresh mechanism. This means:
> - Users must re-login after 30 days
> - No way to revoke tokens if compromised

Implement a refresh token flow:
- Short-lived access token (15min)
- Long-lived refresh token (7 days) stored in DB
- `POST /api/auth/refresh` endpoint
- Auto-refresh on client via RTK Query `baseQueryWithReauth`

**Complexity:** 🟡 Medium

---

## 🟢 Nice-to-Have — Polish

### 17. Message Reply / Quote

Let users reply to a specific message, showing a preview of the original:
- Add `replyTo: ObjectId` ref on Message
- Render reply preview bubble above the message

### 18. Voice Messages

Record and send audio clips using `MediaRecorder` API + Cloudinary upload.

### 19. Message Forwarding

Forward messages to other conversations.

### 20. User Status / Bio

Let users set a custom status message (e.g., "In a meeting", "Available").

### 21. Conversation Pinning

Pin important conversations to the top of the contact list.

### 22. Link Previews

Auto-detect URLs in messages and render Open Graph previews (title, image, description).

### 23. End-to-End Encryption (E2EE)

Client-side encryption using the Web Crypto API. Messages stored encrypted in DB. Only participants can decrypt.

---

## 📋 Suggested Implementation Order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 **P0** | Socket Authentication (#13) | Low | Critical security fix |
| 🔴 **P0** | Input Validation (#4) | Low | Security |
| 🔴 **P0** | Rate Limiting (#5) | Low | Security |
| 🔴 **P0** | Helmet (#14) | Low | Security |
| 🔴 **P1** | N+1 Query Fix (#12) | Medium | Performance |
| 🔴 **P1** | Message Pagination (#1) | Medium | Performance |
| 🟡 **P2** | Message Search (#2) | Medium | UX |
| 🟡 **P2** | Last Seen (#9) | Low | UX |
| 🟡 **P2** | User Search (#11) | Low | UX |
| 🟡 **P2** | Push Notifications (#10) | Low | UX |
| 🟡 **P2** | Message Delete/Edit (#6) | Medium | UX |
| 🟡 **P3** | JWT Refresh Tokens (#16) | Medium | Security |
| 🟡 **P3** | File Sharing (#7) | Medium | Feature |
| 🟡 **P3** | Message Reactions (#8) | Medium | Feature |
| 🔵 **P4** | Group Chat (#3) | High | Feature |
| 🔵 **P4** | Reply/Quote (#17) | Medium | UX |
| 🔵 **P4** | Voice Messages (#18) | Medium | Feature |

---

> [!TIP]
> **Start with the P0 security items** — they're all low-effort and protect your app from common attack vectors. Then tackle pagination + the N+1 query fix, which are the biggest scalability blockers. After that, pick features based on what excites you!

**Which of these would you like to implement first?** I can start building any of them right away.
