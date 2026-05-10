<div align="center">

# 💬 Chat Bridge

**A full-stack real-time chat application with WebSocket-powered messaging, multi-file sharing, and secure token-based authentication.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 💬 Real-Time Messaging

- Instant message delivery via WebSockets
- Bi-directional infinite scroll with cursor-based pagination
- Advanced message search with keyword highlighting
- Live typing indicators (per-user in group chats)
- "Last seen" timestamps for offline users

</td>
<td width="50%">

### 👥 Group Chat & Conversations

- Direct message (DM) and group unified architecture
- Create group chats with multiple members
- Group admin with member management (add/remove)
- Room-based Socket.IO broadcasting
- Multi-user typing indicators in groups

</td>
</tr>
<tr>
<td width="50%">

### 📎 Multi-File Sharing

- **Images**: Client-side compression via `browser-image-compression` before upload
- **Video & Audio**: Native HTML5 playback (`<video>`, `<audio>`) directly in chat
- **Documents**: PDF, DOCX, XLSX, TXT with download-preserving file cards
- Cloudinary CDN with dynamic `resource_type` mapping (image / video / raw)
- 10 MB client-side file size limit
- Blob-based download logic to preserve original filenames and extensions
- Shared Media & Files gallery per conversation

</td>
<td width="50%">

### 🎨 Modern UI/UX

- Dark / Light theme toggle
- Fully responsive (mobile-first design with contacts ↔ chat ↔ media views)
- Emoji picker integration
- Real-time online/offline presence indicators
- Accessible UI with Radix primitives
- Optimized image rendering with constrained dimensions

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Security & Authentication

- **JWT Refresh Token Flow**: Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- Full token rotation on refresh with reuse detection
- Server-side token revocation on logout (hashed tokens stored in DB)
- Automatic silent refresh via RTK Query `baseQueryWithReauth`
- HTTP-only, secure, SameSite cookies
- **Helmet** security headers (HSTS, CSP, XSS protection)
- Rate limiting on auth endpoints
- XSS sanitization on user input
- Zod schema validation on all API inputs

</td>
<td width="50%">

### 🛡️ Robust Error Handling

- Mongoose `ValidationError` → `400` with field-level messages
- Mongoose `CastError` (bad ObjectId) → `400` "Resource not found"
- MongoDB duplicate key (code 11000) → `409` with duplicate field name
- `JsonWebTokenError` → `401` "Token invalid"
- `TokenExpiredError` → `401` "Token expired"
- Graceful fallback for all unhandled errors

</td>
</tr>
</table>

---

## 🛠 Tech Stack

### Frontend

| Technology                        | Purpose                                   |
| --------------------------------- | ----------------------------------------- |
| **React 18** + **TypeScript**     | UI framework with type safety             |
| **Vite 6**                        | Lightning-fast HMR and build tooling      |
| **Redux Toolkit** + **RTK Query** | Global state management and API caching   |
| **Tailwind CSS**                  | Utility-first styling                     |
| **Radix UI**                      | Accessible, unstyled component primitives |
| **Socket.IO Client**              | Bi-directional real-time communication    |
| **React Hook Form** + **Zod**     | Form handling with schema validation      |
| **browser-image-compression**     | Client-side image optimization            |
| **Lucide React**                  | Icon library                              |
| **Moment.js**                     | Human-readable time formatting            |

### Backend

| Technology                 | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| **Node.js** + **Express**  | REST API server                                      |
| **MongoDB** + **Mongoose** | NoSQL database with ODM                              |
| **Socket.IO**              | WebSocket server for real-time events                |
| **JWT** + **Cookies**      | Dual-token auth with HTTP-only cookies               |
| **Cloudinary**             | Cloud-based file storage and CDN (image/video/raw)   |
| **bcryptjs**               | Password hashing and refresh token hashing           |
| **Helmet**                 | Production-ready HTTP security headers               |
| **Zod**                    | Runtime request validation                           |
| **xss**                    | Input sanitization                                   |
| **express-rate-limit**     | Brute-force protection on auth routes                |

---

## 🏗 Architecture

```
chat-bridge/
├── client/                          # React SPA (Vite + TypeScript)
│   └── src/
│       ├── components/              # Shared UI components
│       │   ├── ui/                  # Radix-based design system (Button, Avatar, Dialog…)
│       │   └── layout/             # Private layout, navbar, theme toggle
│       ├── contexts/
│       │   └── socket-context.tsx   # Socket.IO connection provider
│       ├── features/
│       │   ├── auth/                # Login & Registration (pages + hooks)
│       │   └── chat/
│       │       ├── components/      # ChatBody, Contacts, MessageBubble, SharedMedia…
│       │       ├── hooks/           # useChatSocket, useTypingIndicator, useInfiniteScroll
│       │       └── pages/           # Chat page layout
│       ├── lib/
│       │   └── utils.ts             # Shared utilities (cn, downloadFile)
│       ├── store/
│       │   ├── api/                 # RTK Query endpoints (auth, messages, users, conversations)
│       │   └── slices/              # Redux slices (auth, messages, conversations)
│       ├── routes/                  # React Router config with auth guards
│       └── types/                   # Shared TypeScript interfaces
│
├── server/                          # Express API server (TypeScript + ESM)
│   └── src/
│       ├── config/                  # Database connection
│       ├── controllers/             # Route handlers (auth, messages, users, conversations)
│       ├── lib/
│       │   ├── socket.ts            # Socket.IO server setup & event handlers
│       │   └── cloudinary.ts        # Cloudinary SDK config
│       ├── middlewares/             # Auth guard, rate limiter, error handler, validation
│       ├── models/                  # Mongoose schemas (User, Message, Conversation)
│       ├── routes/                  # Express route definitions
│       ├── services/                # Business logic layer
│       ├── validators/              # Zod validation schemas
│       └── utils/                   # Logger, token generation
│
└── package.json                     # Monorepo root (concurrently)
```

### Real-Time Event Flow

```
┌──────────────┐         WebSocket         ┌──────────────┐
│   Client A   │ ◄═══════════════════════► │   Server     │
│  (React +    │   • newMessage            │  (Express +  │
│   Socket.IO) │   • typingMessage         │   Socket.IO) │
│              │   • getOnlineUsers        │              │
│              │   • joinConversation      │              │
└──────────────┘                           └──────┬───────┘
                                                  │
                                                  │ WebSocket
                                                  │
                                           ┌──────▼───────┐
                                           │   Client B   │
                                           │  (React +    │
                                           │   Socket.IO) │
                                           └──────────────┘
```

### Authentication Flow

```
┌─────────┐                        ┌─────────┐                    ┌────────┐
│  Client  │  POST /auth/login     │  Server  │  Hash & Store     │ MongoDB│
│          │ ─────────────────────► │          │ ─────────────────►│        │
│          │                       │          │  Refresh Token     │        │
│          │  Set-Cookie: jwt (15m)│          │                    │        │
│          │  Set-Cookie: refresh  │          │                    │        │
│          │ ◄─────────────────────│          │                    │        │
│          │         (7d)          │          │                    │        │
│          │                       │          │                    │        │
│  ...15 min later...              │          │                    │        │
│          │                       │          │                    │        │
│          │  API call → 401       │          │                    │        │
│          │  POST /auth/refresh   │          │  Verify hash       │        │
│          │ ─────────────────────►│          │ ◄────────────────►│        │
│          │  New jwt + refresh    │          │  Rotate token      │        │
│          │ ◄─────────────────────│          │                    │        │
│          │  Retry original call  │          │                    │        │
└─────────┘                        └─────────┘                    └────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** v6+ (local or Atlas)
- **npm** v9+
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Shafin5714/chat-bridge.git
cd chat-bridge

# 2. Install all dependencies (client + server)
npm run install:all
```

### Environment Setup

<details>
<summary><strong>🔧 Server — <code>server/.env</code></strong></summary>

```bash
cp server/.env.example server/.env
```

```env
MONGO_URI=mongodb://127.0.0.1:27017/chatbridge
NODE_ENV=development
JWT_SECRET="YourAccessTokenSecret"
JWT_REFRESH_SECRET="YourRefreshTokenSecret"
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

> **Note:** Use different, strong secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` in production.

</details>

<details>
<summary><strong>🔧 Client — <code>client/.env.local</code></strong></summary>

```bash
cp client/.env.example client/.env.local
```

```env
VITE_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

</details>

### Run the App

```bash
# Start both server and client concurrently
npm run dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5000 |

> **Tip:** You can also start them separately — run `npm run dev` inside `server/` and `client/` in two terminals.

---

## 📡 API Reference

### Authentication

| Method | Endpoint             | Description                                |
| ------ | -------------------- | ------------------------------------------ |
| `POST` | `/api/auth/register` | Register a new user                        |
| `POST` | `/api/auth/login`    | Login (sets access + refresh token cookies)|
| `POST` | `/api/auth/logout`   | Clear cookies and revoke refresh token     |
| `POST` | `/api/auth/refresh`  | Rotate tokens (issue new access + refresh) |

### Conversations

| Method   | Endpoint                                    | Description                                  |
| -------- | ------------------------------------------- | -------------------------------------------- |
| `GET`    | `/api/conversations`                        | Get all conversations for the logged-in user |
| `POST`   | `/api/conversations/dm`                     | Get or create a DM conversation              |
| `POST`   | `/api/conversations/group`                  | Create a new group conversation              |
| `PUT`    | `/api/conversations/group/:id`              | Update group name/avatar (admin only)        |
| `PUT`    | `/api/conversations/group/:id/members`      | Add members to group (admin only)            |
| `DELETE` | `/api/conversations/group/:id/members/:uid` | Remove a member (admin only)                 |
| `POST`   | `/api/conversations/group/:id/leave`        | Leave a group conversation                   |

### Messages

| Method | Endpoint                              | Description                                          |
| ------ | ------------------------------------- | ---------------------------------------------------- |
| `GET`  | `/api/message/:conversationId`        | Get paginated conversation history                   |
| `GET`  | `/api/message/search/:conversationId` | Search messages by keyword in a conversation         |
| `POST` | `/api/message/send/:conversationId`   | Send a message (text, image, or file attachment)     |

### Users

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| `GET`  | `/api/users`         | Get all registered users      |
| `PUT`  | `/api/users/profile` | Update profile (name, avatar) |

### WebSocket Events

| Event              | Direction       | Payload                                              |
| ------------------ | --------------- | ---------------------------------------------------- |
| `newMessage`       | Server → Client | Full message object (with attachment subdocument)    |
| `typingMessage`    | Client → Server | `{ senderId, conversationId, isTyping }`             |
| `typingMessageGet` | Server → Client | `{ senderId, conversationId, isTyping }`             |
| `getOnlineUsers`   | Server → Client | `string[]` of online user IDs                        |
| `joinConversation` | Client → Server | `conversationId` string                              |

---

## 📜 Available Scripts

| Script                | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run install:all` | Install dependencies for both client and server |
| `npm run dev`         | Start server and client concurrently            |
| `npm run build`       | Build the client for production                 |
| `npm run lint`        | Run ESLint on the client code                   |

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m 'Add amazing feature'`
4. Push to the branch — `git push origin feature/amazing-feature`
5. Open a **Pull Request**

---

## 📄 License

Distributed under the **ISC License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built by [@Shafin5714](https://github.com/Shafin5714)**

⭐ Star this repo if you found it useful!

</div>
