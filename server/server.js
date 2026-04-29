import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Placeholder for future Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for local dev
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Future real-time collaboration events will go here
  // e.g. socket.on('code-change', ...)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Code Editor API is running.');
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
