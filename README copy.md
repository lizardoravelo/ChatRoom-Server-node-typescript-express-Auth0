# 📦 Chatroom API (TypeScript + Express + MongoDB + Socket.IO)

This is a secure, production-ready backend for a real-time **chatroom application**, built with:

- ✅ TypeScript & Express.js
- ✅ WebSockets via Socket.IO
- ✅ JWT-based authentication using Passport
- ✅ Role-based access control (`user`, `admin`)
- ✅ MongoDB via Mongoose
- ✅ Swagger API documentation
- ✅ Rate limiting for DDoS protection
- ✅ CORS validation for multiple origins

---

## 🚀 Features

- **Real-time Messaging** with WebSockets
- **JWT Authentication** for login & protected routes
- **Sign Up / Sign In / User CRUD**
- **Role Management** (`makeAdmin`)
- **Join / Leave Rooms** via Socket.IO
- **Message Broadcasting**
- **Active Users Tracking**
- **Rate Limiting** for `/auth` endpoints
- **Swagger UI** docs at `/api-docs`
- **CORS Policy** with multi-origin support

---

## 🛠 Tech Stack

- Node.js + Express.js
- TypeScript
- MongoDB (Mongoose)
- Passport + JWT
- Socket.IO
- Swagger for API docs
- dotenv for env configs

---

## 📂 Project Structure

```
src/
├── controller/         # Express controllers
├── middleware/         # Authorization, rate limiting, CORS
├── model/              # Mongoose models
├── routes/             # Express routers
├── socket/             # Socket.IO handlers & auth
├── config/             # Constants, env, and Passport strategy
├── swagger/            # Swagger setup
└── index.ts            # Entry point
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root with:

```
PORT=3000
APP_SECRET=your_jwt_secret
MONGODB_URL=mongodb://localhost:27017/chatroom
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
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

- Role-based access control
- Rate limiting (per IP)
- Protected CORS logic
- Sanitized error messages
- Password hashing with bcrypt

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
