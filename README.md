# 📦 Chatroom API (TypeScript + Express + MongoDB + Socket.IO + Auth0)

This is a secure, production-ready backend for a real-time **chatroom application**, built with:

- ✅ TypeScript & Express.js
- ✅ WebSockets via Socket.IO
- ✅ Auth0 authentication (OAuth 2.0, RS256 JWT)
- ✅ Role-based access control (`user`, `admin`)
- ✅ MongoDB via Mongoose
- ✅ Swagger API documentation
- ✅ Rate limiting for DDoS protection
- ✅ CORS validation for multiple origins

---

## 🚀 Features

- **Real-time Messaging** with WebSockets
- **Auth0 JWT Authentication** for protected routes and sockets
- **Sign Up / Sign In via Auth0**
- **Role Management** via Auth0 namespaced claims
- **Join / Leave Rooms** via Socket.IO
- **Message Broadcasting**
- **Active Users Tracking**
- **Rate Limiting** for sensitive endpoints
- **Swagger UI** docs at `/api-docs`
- **CORS Policy** with multi-origin support

---

## 🛠 Tech Stack

- Node.js + Express.js
- TypeScript
- MongoDB (Mongoose)
- Auth0 (OAuth2 + RS256 JWT)
- Socket.IO
- Swagger for API docs
- dotenv for env configs

---

## 📂 Project Structure

```
src/
├── controller/         # Express controllers
├── middleware/         # Auth0 auth check, role authorization
├── model/              # Mongoose models
├── routes/             # Express routers
├── socket/             # Socket.IO handlers & token verification
├── config/             # Constants and env config
├── swagger/            # Swagger setup
└── index.ts            # Entry point
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root with:

```
PORT=3000
MONGODB_URL=mongodb://localhost:27017/chatroom
CORS_ORIGIN=http://localhost:3000,http://localhost:5000

# Auth0
AUTH_DOMAIN=https://your-tenant.auth0.com/
AUTH_AUDIENCE=https://your-api-identifier
AUTH_NAMESPACE=https://your-app.com/
```

---

## 📦 Install Dependencies

```bash
npm install
```

---

## 🔧 Start in Development

```bash
npm run dev
```

---

## 🧪 API Documentation

Available at:

```
http://localhost:3000/api-docs
```

---

## 🔐 Security Features

- Auth0 integration with RS256 JWTs
- Role-based access control via namespaced claims
- Rate limiting (per IP)
- CORS with custom origin checks
- Error message sanitization
- Password hashing (if using local users)

---

## 🗨 Socket.IO Events

| Event                       | Payload / Behavior                |
| --------------------------- | --------------------------------- |
| `join room`                 | `{ roomId }` – Join chatroom      |
| `leave room`                | `{ roomId }` – Leave chatroom     |
| `sendMessage`               | `{ content, roomId, userId }`     |
| `user joined` / `user left` | Server-emitted                    |
| `active users`              | Server-emitted (room member list) |

---

## 📄 License

MIT
