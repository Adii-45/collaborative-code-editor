import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import terminalRoutes from './routes/terminalRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import setupSocket from './socket/index.js';

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for large file trees

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/invite', inviteRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Code Editor API is running', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Socket.io Setup ─────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);

// ─── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
