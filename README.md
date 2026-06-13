# 💬 ChatRoom

A real-time chat application built with **Node.js**, **Express**, and **Socket.io**. Multiple users can join named rooms and chat instantly.

![ChatRoom Preview](https://img.shields.io/badge/status-live-brightgreen) ![Node](https://img.shields.io/badge/node-%3E%3D18-blue) ![Socket.io](https://img.shields.io/badge/socket.io-4.x-black)

## ✨ Features

- 🚀 Real-time messaging with Socket.io
- 🏠 Named chat rooms — join any room by ID
- 🎨 Premium dark-mode UI with glassmorphism
- 👤 Auto-colored user avatars
- 🔔 Join / leave notifications
- 📱 Responsive layout

## 🛠 Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Server   | Node.js + Express 5 |
| Realtime | Socket.io 4         |
| Frontend | Vanilla HTML/CSS/JS |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start (production)
npm start

# Start with auto-reload (development)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Chat/
├── client.html   # Frontend UI
├── server.js     # Express + Socket.io server
├── index.js      # Entry point (starts server on port 3000)
└── package.json
```

## 🌐 Deployment

Recommended: **[Railway](https://railway.app)** — supports WebSockets out of the box, free tier available.

See deployment notes below or the Railway guide for one-click deploys.
