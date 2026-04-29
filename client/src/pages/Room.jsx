import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Navbar from '../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import Terminal from '../components/Terminal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import toast from 'react-hot-toast';
import { updateFileContent, addNode, deleteNode, renameNode, moveNode } from '../utils/defaultFiles';

const Room = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filesTree, setFilesTree] = useState(null); // null = loading
  const [project, setProject] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [openedFiles, setOpenedFiles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loadingProject, setLoadingProject] = useState(true);

  // Ref to track whether file change is from remote (socket) or local
  const isRemoteChange = useRef(false);
  // Debounce timer for saving file tree to DB
  const saveTimerRef = useRef(null);

  // ─── Load Project from API ─────────────────────────────
  useEffect(() => {
    const loadProject = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        setFilesTree(data.fileTree);
        setProject(data);
        setLoadingProject(false);
      } catch (error) {
        toast.error('Failed to load project');
        navigate('/dashboard');
      }
    };
    loadProject();
  }, [projectId, navigate]);

  // ─── Socket.io Connection ─────────────────────────────
  useEffect(() => {
    if (!user || loadingProject) return;

    // Connect socket
    socket.connect();

    // Join the project room
    socket.emit('join-room', {
      projectId,
      userId: user._id,
      username: user.username,
    });

    // Listen for remote file changes
    socket.on('file-change', ({ fileTree }) => {
      isRemoteChange.current = true;
      setFilesTree(fileTree);
    });

    // Listen for user presence
    socket.on('room-users', ({ users }) => {
      setConnectedUsers(users);
    });

    socket.on('user-joined', ({ users, username }) => {
      setConnectedUsers(users);
      toast.success(`${username} joined`, { duration: 2000 });
    });

    socket.on('user-left', ({ users, username }) => {
      setConnectedUsers(users);
      toast(`${username} left`, { icon: '👋', duration: 2000 });
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave-room', { projectId });
      socket.off('file-change');
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.disconnect();
    };
  }, [projectId, user, loadingProject]);

  // ─── Save file tree to DB (debounced) ──────────────────
  const saveFileTree = useCallback((newTree) => {
    // Clear previous timer
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    // Debounce: save after 1.5 seconds of inactivity
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.put(`/projects/${projectId}/tree`, { fileTree: newTree });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1500);
  }, [projectId]);

  // ─── Emit file change to socket + save to DB ──────────
  const emitChange = useCallback((newTree, changedFileId, changeType) => {
    // Don't re-broadcast remote changes
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    // Broadcast to other users in the room
    socket.emit('file-change', {
      projectId,
      fileTree: newTree,
      changedFileId,
      changeType,
    });

    // Save to database (debounced)
    saveFileTree(newTree);
  }, [projectId, saveFileTree]);

  // ─── File Tree Operations ──────────────────────────────
  const handleCodeChange = (id, newCode) => {
    setFilesTree(prev => {
      const newTree = updateFileContent(prev, id, newCode);
      emitChange(newTree, id, 'content');
      return newTree;
    });
  };

  const openFile = (id) => {
    if (!openedFiles.includes(id)) {
      setOpenedFiles(prev => [...prev, id]);
    }
    setActiveFile(id);
  };

  const closeFile = (id) => {
    const newOpened = openedFiles.filter(f => f !== id);
    setOpenedFiles(newOpened);
    if (activeFile === id) {
      setActiveFile(newOpened.length > 0 ? newOpened[newOpened.length - 1] : null);
    }
  };

  const handleCreateNode = (parentId, name, type) => {
    const newNode = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      type,
    };
    if (type === 'folder') newNode.children = [];
    else newNode.content = '';

    setFilesTree(prev => {
      const newTree = addNode(prev, parentId, newNode);
      emitChange(newTree, newNode.id, 'create');
      return newTree;
    });
    if (type === 'file') {
      openFile(newNode.id);
    }
  };

  const handleDeleteNode = (id) => {
    setFilesTree(prev => {
      const newTree = deleteNode(prev, id);
      emitChange(newTree, id, 'delete');
      return newTree;
    });
    closeFile(id);
  };

  const handleRenameNode = (id, newName) => {
    setFilesTree(prev => {
      const newTree = renameNode(prev, id, newName);
      emitChange(newTree, id, 'rename');
      return newTree;
    });
  };

  const handleMoveNode = (id, newParentId) => {
    setFilesTree(prev => {
      const newTree = moveNode(prev, id, newParentId);
      emitChange(newTree, id, 'move');
      return newTree;
    });
  };

  // ─── Loading State ─────────────────────────────────────
  if (loadingProject || !filesTree) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Loading project...</span>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e]">
      <Navbar
        isRunning={isRunning}
        toggleRun={() => setIsRunning(!isRunning)}
        toggleTerminal={() => setShowTerminal(!showTerminal)}
        showTerminal={showTerminal}
        projectName={project?.name}
        connectedUsers={connectedUsers}
        projectId={projectId}
        project={project}
      />
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15}>
            <FileExplorer
              filesTree={filesTree}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              openFile={openFile}
              onCreateNode={handleCreateNode}
              onDeleteNode={handleDeleteNode}
              onRenameNode={handleRenameNode}
              onMoveNode={handleMoveNode}
            />
          </Panel>
          <PanelResizeHandle className="w-1 bg-[#30363d] hover:bg-blue-500 transition-colors cursor-col-resize" />
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={showTerminal ? 70 : 100}>
                <Editor
                  filesTree={filesTree}
                  openedFiles={openedFiles}
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                  closeFile={closeFile}
                  onCodeChange={handleCodeChange}
                />
              </Panel>
              {showTerminal && (
                <>
                  <PanelResizeHandle className="h-1 bg-[#30363d] hover:bg-blue-500 transition-colors cursor-row-resize z-10" />
                  <Panel defaultSize={30} minSize={15}>
                    <Terminal />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="w-1 bg-[#30363d] hover:bg-blue-500 transition-colors cursor-col-resize" />
          <Panel defaultSize={30} minSize={20}>
            <Preview filesTree={filesTree} isRunning={isRunning} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Room;
