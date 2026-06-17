# 💬 ChatterUp

A real-time chat application built with **Node.js**, **Express**, **Socket.io**, and a **React + Vite** frontend. Multiple users can join named rooms and chat instantly — messages are persisted in MongoDB.

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue)
![Socket.io](https://img.shields.io/badge/socket.io-4.x-black)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/mongodb-atlas-47A248?logo=mongodb&logoColor=white)

---

## ✨ Features

- 🚀 Real-time messaging with Socket.io
- 🏠 Named chat rooms — join any room by ID
- 🗄️ Persistent message history via MongoDB
- 🎨 Premium dark-mode UI with glassmorphism
- 👤 Auto-generated user avatars
- 🔔 Join / leave notifications
- ⌨️ Typing indicators
- 👥 Live online user list
- 📱 Fully responsive layout

---

## 🛠 Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Server    | Node.js + Express 5      |
| Realtime  | Socket.io 4              |
| Database  | MongoDB (Mongoose)       |
| Frontend  | React 19 + Vite          |
| Hosting   | Render (recommended)     |

---

## 🚀 Local Development

### Prerequisites

- Node.js ≥ 18
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1 — Clone & install

```bash
git clone https://github.com/<your-username>/chatterup.git
cd chatterup

# Install server dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 2 — Configure environment

```bash
cp .env.example .env
# Open .env and fill in MONGO_URI and (optionally) ALLOWED_ORIGINS
```

| Variable          | Description                                          | Example                                              |
|-------------------|------------------------------------------------------|------------------------------------------------------|
| `PORT`            | Port the server listens on                           | `3000`                                               |
| `MONGO_URI`       | MongoDB connection string                            | `mongodb+srv://user:pass@cluster.mongodb.net/chat`   |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (omit to allow all)     | `http://localhost:5173,https://chatterup.onrender.com` |

### 3 — Run

```bash
# Terminal 1 — backend (auto-reloads with nodemon)
npm run dev

# Terminal 2 — frontend dev server (Vite HMR)
cd client && npm run dev
```

- Backend: [http://localhost:3000](http://localhost:3000)
- Frontend: [http://localhost:5173](http://localhost:5173) (proxied to backend automatically)

---

## 📁 Project Structure

```
Chat/
├── index.js           # Entry point — starts the HTTP server
├── server.js          # Express + Socket.io logic
├── models/
│   └── Message.js     # Mongoose schema for chat messages
├── client/            # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── render.yaml        # Render Blueprint (one-click deploy)
├── .env.example       # Environment variable template
└── package.json
```

---

## ☁️ Deploy to Render

ChatterUp ships with a [`render.yaml`](./render.yaml) blueprint that configures everything automatically.

### Step-by-step

1. **Push your repo to GitHub** (make sure `.env` is in `.gitignore` — it already is).

2. **Create a MongoDB Atlas cluster** (free tier works great):
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free `M0` cluster → **Connect** → **Drivers** → copy the connection string
   - Whitelist all IPs (`0.0.0.0/0`) or Render's outbound IPs

3. **Create a new Render account / log in** at [render.com](https://render.com)

4. **New Web Service → Connect your GitHub repo**
   - Render will auto-detect `render.yaml` and pre-fill all settings
   - Alternatively set manually:
     | Field          | Value                              |
     |----------------|------------------------------------|
     | Runtime        | Node                               |
     | Build Command  | `npm install && npm run build`     |
     | Start Command  | `npm start`                        |
     | Node Version   | 18 (or higher)                     |

5. **Set environment variables** in the Render dashboard → *Environment* tab:

   | Key               | Value                                             |
   |-------------------|---------------------------------------------------|
   | `MONGO_URI`       | Your Atlas connection string                      |
   | `ALLOWED_ORIGINS` | `https://<your-service>.onrender.com`             |
   | `NODE_ENV`        | `production`                                      |

6. **Click Deploy** — Render will:
   - Install server dependencies
   - Build the React client (`npm run build`)
   - Start the Node server which serves the built client + WebSocket connections

7. **Visit your live URL** — it will look like `https://chatterup.onrender.com` 🎉

> [!NOTE]
> On Render's **free plan**, the service spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. Upgrade to the **Starter** plan ($7/month) for always-on hosting.

> [!IMPORTANT]
> Make sure `ALLOWED_ORIGINS` is set to your exact Render URL (no trailing slash) to avoid CORS errors with Socket.io.

---

## 📄 License

ISC — see [LICENSE](./LICENSE)
