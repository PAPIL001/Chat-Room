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

// ── MongoDB ──────────────────────────────────────────────────────────────────
mongoose.connect('mongodb://localhost:27017/chatterup')
    .then(() => console.log('MongoDB connected → chatterup'))
    .catch(err => console.error('MongoDB connection error:', err));

// ── Express ──────────────────────────────────────────────────────────────────
export const app = express();
app.use(cors());

// Serve the React build in production
const distPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(distPath));
app.get('/', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// room  →  Map<socketId, { username, avatarSeed }>
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
            console.error('Failed to load history:', err);
            socket.emit('chat-history', []);
        }

        // Notify others a user joined
        socket.to(roomnumber).emit('user-joined', `${username} joined the room`);

        // Broadcast updated online list to everyone in room
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

        // Broadcast to room
        io.to(socket.room).emit('message', msgData);

        // Persist to DB
        try {
            await Message.create({
                room:       socket.room,
                username:   socket.username,
                text,
                avatarSeed: socket.avatarSeed,
                timestamp
            });
        } catch (err) {
            console.error('Failed to save message:', err);
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

export default server;