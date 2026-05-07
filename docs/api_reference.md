# 🛠 API Reference

Below is the complete list of REST API endpoints exposed by the Chat Bridge backend.

**Base URL:** `http://localhost:5000`

---

## 🔐 Auth Routes (`/api/auth`)

All auth responses set or clear an HTTP-only `jwt` cookie.

| Method | Endpoint | Protection | Description | Body |
|--------|----------|------------|-------------|------|
| `POST` | `/register` | Public | Register a new user | `{ name, email, password }` |
| `POST` | `/login` | Public | Authenticate a user | `{ email, password }` |
| `POST` | `/logout` | Public | Clear auth cookie | None |

---

## 💬 Conversation Routes (`/api/conversations`)

| Method | Endpoint | Protection | Description | Body |
|--------|----------|------------|-------------|------|
| `GET` | `/` | Private | Get all user's conversations | None |
| `POST` | `/dm/:id` | Private | Create or get a 1:1 chat | None |
| `POST` | `/group` | Private | Create a new group chat | `{ name, members: [id, id] }` |
| `PUT` | `/group/:id` | Private | Update group details | `{ name, avatar }` |
| `POST` | `/group/:id/add` | Private (Admin) | Add members to group | `{ members: [id] }` |
| `POST` | `/group/:id/remove` | Private (Admin) | Remove member from group | `{ userId }` |
| `POST` | `/group/:id/leave` | Private | Leave a group chat | None |

---

## ✉️ Message Routes (`/api/message`)

| Method | Endpoint | Protection | Description | Query/Body |
|--------|----------|------------|-------------|------------|
| `GET` | `/:conversationId` | Private | Get paginated messages | `?cursor=id&limit=30` |
| `GET` | `/search/:conversationId`| Private | Keyword search | `?q=hello` |
| `POST` | `/send/:conversationId` | Private | Send a new message | `{ text, image }` |

---

## 👤 User Routes (`/api/users`)

| Method | Endpoint | Protection | Description | Body |
|--------|----------|------------|-------------|------|
| `GET` | `/` | Private | Get all available users (excluding self) | None |

> Note: All `Private` endpoints require a valid JWT cookie and will return `401 Unauthorized` if missing.
