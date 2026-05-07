<div align="center">

# 💬 Chat Bridge

**A full-stack real-time chat application with WebSocket-powered messaging, media sharing, and online presence tracking.**

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
- Cursor-based message pagination with infinite scroll
- Text and image message support
- Read receipts with live status sync
- Live typing indicators

</td>
<td width="50%">

### 👥 User Presence

- Real-time online/offline status
- Contact list with last message preview
- Unread message count badges
- User profile with avatar uploads

</td>
</tr>
<tr>
<td width="50%">

### 📸 Media Sharing

- Image upload via Cloudinary CDN
- Client-side image compression
- Base64 encoding for seamless uploads
- Shared media gallery per conversation

</td>
<td width="50%">

### 🎨 Modern UI/UX

- Dark / Light theme toggle
- Fully responsive (mobile-first design)
- Emoji picker integration
- Accessible UI with Radix primitives

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
| **Lucide React**                  | Icon library                              |

### Backend

| Technology                 | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| **Node.js** + **Express**  | REST API server                                 |
| **MongoDB** + **Mongoose** | NoSQL database with ODM                         |
| **Socket.IO**              | WebSocket server for real-time events           |
| **JWT** + **Cookies**      | Stateless authentication with HTTP-only cookies |
| **Cloudinary**             | Cloud-based image storage and CDN               |
| **bcryptjs**               | Secure password hashing                         |

---

## 🏗 Architecture

```
chat-bridge/
├── client/                          # React SPA (Vite + TypeScript)
│   └── src/
│       ├── components/              # Shared UI components
│       │   ├── ui/                  # Radix-based design system (Button, Avatar, Dialog…)
│       │   ├── private-layout.tsx   # Authenticated app shell with navbar
│       │   ├── mode-toggle.tsx      # Dark/light theme switcher
│       │   └── theme-provider.tsx   # Theme context provider
│       ├── contexts/
│       │   └── socket-context.tsx   # Socket.IO connection provider
│       ├── features/
│       │   ├── auth/                # Login & Registration pages
│       │   └── chat/
│       │       ├── components/      # Chat UI (ChatBody, Contacts, ProfileModal…)
│       │       ├── hooks/           # useChatSocket, useTypingIndicator
│       │       └── pages/           # Chat page layout
│       ├── store/
│       │   ├── api/                 # RTK Query endpoints (auth, messages, users)
│       │   └── slices/              # Redux slices (auth, messages, users)
│       ├── routes/                  # React Router config with auth guards
│       └── types/                   # Shared TypeScript interfaces
│
├── server/                          # Express API server (ES Modules)
│   └── src/
│       ├── config/                  # Database connection
│       ├── controllers/             # Route handlers (auth, messages, users)
│       ├── lib/
│       │   ├── socket.js            # Socket.IO server setup & event handlers
│       │   └── cloudinary.js        # Cloudinary SDK config
│       ├── middlewares/             # Auth guard, async handler, error handler
│       ├── models/                  # Mongoose schemas (User, Message)
│       ├── routes/                  # Express route definitions
│       ├── services/                # Business logic layer
│       └── utils/                   # Logger and helpers
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
│              │   • updatedUsers          │              │
│              │   • messagesRead          │              │
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

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+
- **MongoDB** v4.4+ (local or Atlas)
- **npm** or **yarn**
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
JWT_EXPIRES_IN=1h
JWT_SECRET="YourSecretKey"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

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

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| `POST` | `/api/auth/register` | Register a new user          |
| `POST` | `/api/auth/login`    | Login and receive JWT cookie |
| `POST` | `/api/auth/logout`   | Clear auth cookie            |

### Messages

| Method | Endpoint                | Description                                   |
| ------ | ----------------------- | --------------------------------------------- |
| `GET`  | `/api/message/users`    | Get contacts with last message & unread count |
| `GET`  | `/api/message/:id`      | Get paginated conversation history            |
| `POST` | `/api/message/send/:id` | Send a text or image message                  |
| `PUT`  | `/api/message/read/:id` | Mark messages from a user as read             |

### Users

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| `PUT`  | `/api/users/profile` | Update profile (name, avatar) |

### WebSocket Events

| Event              | Direction       | Payload                              |
| ------------------ | --------------- | ------------------------------------ |
| `newMessage`       | Server → Client | Message object                       |
| `typingMessage`    | Client → Server | `{ senderId, receiverId, isTyping }` |
| `typingMessageGet` | Server → Client | `{ senderId, receiverId, isTyping }` |
| `getOnlineUsers`   | Server → Client | `string[]` of user IDs               |
| `updatedUsers`     | Server → Client | Updated user list with last messages |
| `messagesRead`     | Server → Client | `{ receiverId }`                     |

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
