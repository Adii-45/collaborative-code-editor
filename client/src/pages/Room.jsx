import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Navbar from '../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import Editor from '../components/Editor';
import OutputConsole from '../components/OutputConsole';
import ActivityBar from '../components/ActivityBar';
import RightSidebar from '../components/RightSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import toast from 'react-hot-toast';
import { updateFileContent, addNode, deleteNode, renameNode, moveNode } from '../utils/defaultFiles';

const Room = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filesTree, setFilesTree] = useState(null);
  const [project, setProject] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [openedFiles, setOpenedFiles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutputConsole, setShowOutputConsole] = useState(true); // Default true based on screenshot
  const [runLogs, setRunLogs] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loadingProject, setLoadingProject] = useState(true);

  const isRemoteChange = useRef(false);
  const saveTimerRef = useRef(null);

  // ─── Load Project from API ─────────────────────────────
  useEffect(() => {
    const loadProject = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        setFilesTree(data.fileTree);
        setProject(data);
        
        try {
          const { data: statusData } = await api.get(`/run/status/${projectId}`);
          if (statusData.status === 'running') {
            setIsRunning(true);
            setShowOutputConsole(true);
            if (statusData.port) {
              setPreviewUrl(`http://localhost:${statusData.port}`);
            }
          }
        } catch (err) {
          console.error('Failed to fetch run status:', err);
        }

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

    socket.connect();
    socket.emit('join-room', {
      projectId,
      userId: user._id,
      username: user.username,
    });

    socket.on('file-change', ({ fileTree }) => {
      isRemoteChange.current = true;
      setFilesTree(fileTree);
    });

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

    socket.on('run:log', (entry) => {
      setRunLogs(prev => [...prev, entry]);
    });

    socket.on('run:started', ({ type, port }) => {
      setIsRunning(true);
      if (port) setPreviewUrl(`http://localhost:${port}`);
      else setPreviewUrl(null);
    });

    socket.on('run:end', () => {
      setIsRunning(false);
      setPreviewUrl(null);
    });

    socket.on('run:error', ({ message }) => {
      toast.error(message);
      setIsRunning(false);
      setPreviewUrl(null);
    });

    return () => {
      socket.emit('leave-room', { projectId });
      socket.off('file-change');
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('run:log');
      socket.off('run:started');
      socket.off('run:end');
      socket.off('run:error');
      socket.disconnect();
    };
  }, [projectId, user, loadingProject]);

  // ─── Save file tree to DB (debounced) ──────────────────
  const saveFileTree = useCallback((newTree) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
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
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    socket.emit('file-change', {
      projectId,
      fileTree: newTree,
      changedFileId,
      changeType,
    });
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
    if (!openedFiles.includes(id)) setOpenedFiles(prev => [...prev, id]);
    setActiveFile(id);
  };

  const closeFile = (id) => {
    const newOpened = openedFiles.filter(f => f !== id);
    setOpenedFiles(newOpened);
    if (activeFile === id) setActiveFile(newOpened.length > 0 ? newOpened[newOpened.length - 1] : null);
  };

  const handleCreateNode = (parentId, name, type) => {
    const newNode = { id: Math.random().toString(36).substring(2, 9), name, type };
    if (type === 'folder') newNode.children = [];
    else newNode.content = '';
    setFilesTree(prev => {
      const newTree = addNode(prev, parentId, newNode);
      emitChange(newTree, newNode.id, 'create');
      return newTree;
    });
    if (type === 'file') openFile(newNode.id);
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

  if (loadingProject || !filesTree) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0A0D14]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Loading project...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0D14] overflow-hidden text-white font-sans">
      <Navbar
        isRunning={isRunning}
        toggleRun={async () => {
          if (isRunning) {
            await api.post(`/run/stop/${projectId}`);
            setIsRunning(false);
          } else {
            setRunLogs([]);
            setShowOutputConsole(true);
            try {
              const { data } = await api.post(`/run/start/${projectId}`);
              setIsRunning(true);
              if (data.alreadyRunning) {
                const { data: statusData } = await api.get(`/run/status/${projectId}`);
                if (statusData.port) setPreviewUrl(`http://localhost:${statusData.port}`);
              }
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to start project');
            }
          }
        }}
        toggleTerminal={() => setShowOutputConsole(!showOutputConsole)}
        showTerminal={showOutputConsole}
        projectName={project?.name}
        connectedUsers={connectedUsers}
        projectId={projectId}
        project={project}
        activeFile={activeFile}
        filesTree={filesTree}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        
        <div className="flex-1 overflow-hidden h-full">
          <PanelGroup direction="horizontal">
            {/* File Explorer Panel */}
            <Panel defaultSize={18} minSize={12} maxSize={30}>
              <div className="h-full bg-[#11161D] border-r border-[#1E232B]">
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
              </div>
            </Panel>
            <PanelResizeHandle className="w-0.5 bg-transparent hover:bg-blue-500 transition-colors cursor-col-resize z-20" />
            
            {/* Center Area (Editor + Terminal) */}
            <Panel defaultSize={57} minSize={30}>
              <div className="h-full bg-[#0A0D14] flex flex-col">
                <PanelGroup direction="vertical">
                  <Panel defaultSize={showOutputConsole ? 70 : 100}>
                    <Editor
                      filesTree={filesTree}
                      openedFiles={openedFiles}
                      activeFile={activeFile}
                      setActiveFile={setActiveFile}
                      closeFile={closeFile}
                      onCodeChange={handleCodeChange}
                    />
                  </Panel>
                  {showOutputConsole && (
                    <>
                      <PanelResizeHandle className="h-0.5 bg-transparent hover:bg-blue-500 transition-colors cursor-row-resize z-20" />
                      <Panel defaultSize={30} minSize={15}>
                        <div className="h-full bg-[#11161D] border-t border-[#1E232B]">
                          <OutputConsole
                            logs={runLogs}
                            onClear={() => setRunLogs([])}
                            isRunning={isRunning}
                          />
                        </div>
                      </Panel>
                    </>
                  )}
                </PanelGroup>
              </div>
            </Panel>
            
            <PanelResizeHandle className="w-0.5 bg-transparent hover:bg-blue-500 transition-colors cursor-col-resize z-20" />
            
            {/* Right Sidebar (Member Presence + AI) */}
            <Panel defaultSize={25} minSize={20} maxSize={40}>
              <RightSidebar 
                connectedUsers={connectedUsers} 
                filesTree={filesTree}
                isRunning={isRunning}
                previewUrl={previewUrl}
              />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Room;
