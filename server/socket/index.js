/**
 * Socket.io handler for real-time collaboration.
 * 
 * Architecture:
 * - Each project is a "room" identified by projectId
 * - Users join/leave rooms when opening/closing projects
 * - File changes are broadcast to all other users in the room
 * - Cursor positions are broadcast for multi-user awareness
 * 
 * FUTURE: Replace raw event broadcasting with Yjs CRDT document sync.
 * The event names and room structure are designed to make that transition minimal.
 */

const setupSocket = (io) => {
  // Track connected users per room for presence
  const rooms = new Map(); // roomId -> Set of { socketId, userId, username }

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

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
     * 
     * changeType can be: 'content', 'create', 'delete', 'rename', 'move'
     * This granular event type is designed so that future Yjs integration
     * can handle each change type differently.
     */
    socket.on('file-change', ({ projectId, fileTree, changedFileId, changeType }) => {
      // Broadcast to all OTHER users in the room (not back to sender)
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
     * Payload: { projectId, fileId, position: { lineNumber, column } }
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

    /**
     * disconnect: Clean up when socket disconnects
     */
    socket.on('disconnect', () => {
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
    // Remove this socket from the room set
    for (const user of roomUsers) {
      if (user.socketId === socket.id) {
        roomUsers.delete(user);
        break;
      }
    }

    // Clean up empty rooms
    if (roomUsers.size === 0) {
      rooms.delete(projectId);
    } else {
      // Notify remaining users
      socket.to(projectId).emit('user-left', {
        userId: socket.userId,
        username: socket.username,
        users: Array.from(roomUsers),
      });
    }
  }
};

export default setupSocket;
