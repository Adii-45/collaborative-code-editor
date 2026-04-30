/**
 * Socket.io handler for real-time collaboration AND terminal sessions.
 * 
 * Architecture:
 * - Each project is a "room" identified by projectId
 * - Users join/leave rooms when opening/closing projects
 * - File changes are broadcast to all other users in the room
 * - Terminal sessions are per-socket, streamed via node-pty + Docker
 * 
 * FUTURE: Replace raw event broadcasting with Yjs CRDT document sync.
 */

import Project from '../models/Project.js';
import { syncTreeToDisk } from '../utils/fsUtils.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPOS_DIR = path.resolve(__dirname, '..', 'repos');

const setupSocket = (io) => {
  // Track connected users per room for presence
  const rooms = new Map(); // roomId -> Set of { socketId, userId, username }

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Track terminal sessions owned by this socket for cleanup
    socket._terminalSessions = [];

    // ═══════════════════════════════════════════════════════════
    // COLLABORATION EVENTS (unchanged from Phase 1)
    // ═══════════════════════════════════════════════════════════

    /**
     * join-room: User opens a project
     * Payload: { projectId, userId, username }
     */
    socket.on('join-room', ({ projectId, userId, username }) => {
      socket.join(projectId);

      // Track user in room
      if (!rooms.has(projectId)) {
        rooms.set(projectId, new Set());
      }
      rooms.get(projectId).add({ socketId: socket.id, userId, username });

      // Store room info on socket for cleanup
      socket.projectId = projectId;
      socket.userId = userId;
      socket.username = username;

      // Notify others in the room
      socket.to(projectId).emit('user-joined', {
        userId,
        username,
        users: Array.from(rooms.get(projectId)),
      });

      // Send current room users to the joining user
      socket.emit('room-users', {
        users: Array.from(rooms.get(projectId)),
      });

      console.log(`User ${username} joined room ${projectId}`);
    });

    /**
     * file-change: User modified the file tree
     * Payload: { fileTree, changedFileId, changeType }
     */
    socket.on('file-change', ({ projectId, fileTree, changedFileId, changeType }) => {
      socket.to(projectId).emit('file-change', {
        fileTree,
        changedFileId,
        changeType,
        userId: socket.userId,
        username: socket.username,
      });
    });

    /**
     * cursor-move: User moved their cursor in the editor
     */
    socket.on('cursor-move', ({ projectId, fileId, position }) => {
      socket.to(projectId).emit('cursor-move', {
        userId: socket.userId,
        username: socket.username,
        fileId,
        position,
      });
    });

    /**
     * leave-room: User explicitly leaves a project
     */
    socket.on('leave-room', ({ projectId }) => {
      handleLeaveRoom(socket, projectId, rooms);
    });

    // ═══════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════
    // DISCONNECT
    // ═══════════════════════════════════════════════════════════

    socket.on('disconnect', () => {
      // Clean up room presence
      if (socket.projectId) {
        handleLeaveRoom(socket, socket.projectId, rooms);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Helper: Remove user from room tracking and notify remaining users.
 */
const handleLeaveRoom = (socket, projectId, rooms) => {
  socket.leave(projectId);

  if (rooms.has(projectId)) {
    const roomUsers = rooms.get(projectId);
    for (const user of roomUsers) {
      if (user.socketId === socket.id) {
        roomUsers.delete(user);
        break;
      }
    }

    if (roomUsers.size === 0) {
      rooms.delete(projectId);
    } else {
      socket.to(projectId).emit('user-left', {
        userId: socket.userId,
        username: socket.username,
        users: Array.from(roomUsers),
      });
    }
  }
};

/**
 * Helper: Sync a project's fileTree from MongoDB to the local disk.
 * This ensures the Docker container has the latest files.
 */
const syncProjectToDisk = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    const localPath = path.join(REPOS_DIR, projectId.toString());
    await fs.mkdir(localPath, { recursive: true });

    if (project.fileTree) {
      await syncTreeToDisk(project.fileTree, localPath);
    }
  } catch (error) {
    console.error(`[Socket] Sync to disk error for ${projectId}:`, error.message);
  }
};

export default setupSocket;
