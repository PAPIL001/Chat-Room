import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Message from './models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Environment variables (loaded from .env) ─────────────────────────────────
const PORT         = process.env.PORT || 3000;
const MONGO_URI    = process.env.MONGO_URI;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : '*';

if (!MONGO_URI) {
    console.error('❌  MONGO_URI is not defined. Create a .env file — see .env.example');
    process.exit(1);
}

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅  MongoDB connected →', MONGO_URI.replace(/:\/\/.*@/, '://<credentials>@')))
    .catch(err => {
        console.error('❌  MongoDB connection error:', err.message);
        process.exit(1);
    });

// ── Express ───────────────────────────────────────────────────────────────────
export const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS }));

// Serve the React build in production
const distPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(distPath));
// SPA fallback — any unknown route returns index.html so React Router works
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }
});

// room → Map<socketId, { username, avatarSeed }>
const roomUsers = new Map();

function getRoomList(room) {
    if (!roomUsers.has(room)) return [];
    return Array.from(roomUsers.get(room).values());
}

io.on('connection', (socket) => {
    console.log('Connection made:', socket.id);

    // ── Join ──────────────────────────────────────────────────────────────────
    socket.on('join', async ({ username, roomnumber, avatarSeed }) => {
        socket.username   = username;
        socket.room       = roomnumber;
        socket.avatarSeed = avatarSeed ?? 0;

        socket.join(roomnumber);

        // Track online users
        if (!roomUsers.has(roomnumber)) roomUsers.set(roomnumber, new Map());
        roomUsers.get(roomnumber).set(socket.id, { username, avatarSeed: socket.avatarSeed });

        // Send chat history to the joining socket
        try {
            const history = await Message
                .find({ room: roomnumber })
                .sort({ timestamp: 1 })
                .limit(50)
                .lean();
            socket.emit('chat-history', history);
        } catch (err) {
            console.error('Failed to load history:', err.message);
            socket.emit('chat-history', []);
        }

        // Notify others
        socket.to(roomnumber).emit('user-joined', `${username} joined the room`);

        // Broadcast updated online list
        io.to(roomnumber).emit('online-users', getRoomList(roomnumber));
        io.to(roomnumber).emit('user-count', roomUsers.get(roomnumber).size);
    });

    // ── Message ───────────────────────────────────────────────────────────────
    socket.on('newMessage', async (text) => {
        if (!socket.room || !socket.username) return;

        const timestamp = new Date();
        const msgData = {
            user:       socket.username,
            text,
            avatarSeed: socket.avatarSeed,
            timestamp
        };

        io.to(socket.room).emit('message', msgData);

        try {
            await Message.create({
                room:       socket.room,
                username:   socket.username,
                text,
                avatarSeed: socket.avatarSeed,
                timestamp
            });
        } catch (err) {
            console.error('Failed to save message:', err.message);
        }
    });

    // ── Typing ────────────────────────────────────────────────────────────────
    socket.on('typing', () => {
        if (socket.room && socket.username)
            socket.to(socket.room).emit('typing', { username: socket.username });
    });

    socket.on('stop-typing', () => {
        if (socket.room && socket.username)
            socket.to(socket.room).emit('stop-typing', { username: socket.username });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
        if (socket.room) {
            socket.to(socket.room).emit('user-joined', `${socket.username} left the room`);

            const users = roomUsers.get(socket.room);
            if (users) {
                users.delete(socket.id);
                io.to(socket.room).emit('online-users', getRoomList(socket.room));
                io.to(socket.room).emit('user-count', users.size);
            }
        }
        console.log('Connection disconnected:', socket.id);
    });
});

export { PORT };
export default server;