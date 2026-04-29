import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8001';

/**
 * Socket.io client singleton.
 * 
 * Usage:
 *   import socket from './socket';
 *   socket.connect();
 *   socket.emit('join-room', { projectId, userId, username });
 * 
 * The socket starts disconnected — call connect() explicitly when needed.
 * This prevents unnecessary connections on pages that don't need real-time.
 */
const socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect until explicitly called
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
