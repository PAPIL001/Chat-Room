import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(cors());
app.use(express.static(__dirname));  // serves style.css and any other static assets
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'client.html')));
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Connection made.");

    socket.on("join", ({ username, roomnumber }) => {
        socket.username = username;
        socket.room = roomnumber;
        socket.join(roomnumber);

        socket.to(roomnumber).emit("user-joined", `${username} joined the room`);
    });

    socket.on('newMessage', (msg) => {
        io.to(socket.room).emit("message", {
            user: socket.username,
            text: msg
        });
    });

    socket.on("disconnect", () => {
        socket.to(socket.room).emit("user-joined", `${socket.username} left the room`);
        console.log("Connection disconnected.");
    });
});

export default server;