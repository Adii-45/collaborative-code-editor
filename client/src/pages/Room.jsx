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
import { Mic, PhoneOff } from 'lucide-react';

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
              <div className="h-full bg-[#11161D] border-r border-[#1E232B] flex flex-col">
                <div className="flex-1 overflow-hidden">
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
                
                {/* Timeline Panel */}
                <div className="h-1/3 min-h-[150px] border-t border-[#1E232B] flex flex-col select-none">
                  <div className="px-4 py-3 flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Timeline</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                    <div className="relative pl-3 border-l-2 border-[#1E232B]">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-[11px] font-medium text-gray-200">Updated Hero component</p>
                      <p className="text-[10px] text-gray-500">Alex • 2m ago</p>
                    </div>
                    <div className="relative pl-3 border-l-2 border-[#1E232B]">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-600"></div>
                      <p className="text-[11px] font-medium text-gray-400">Fix responsive layout</p>
                      <p className="text-[10px] text-gray-500">Sarah • 1h ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="w-0.5 bg-transparent hover:bg-blue-500 transition-colors cursor-col-resize z-20" />
            
            {/* Center Area (Editor + Terminal) */}
            <Panel defaultSize={57} minSize={30}>
              <div className="h-full bg-[#0A0D14] flex flex-col">
                <PanelGroup direction="vertical">
                  <Panel defaultSize={showOutputConsole ? 70 : 100}>
                    <div className="h-full relative flex flex-col">
                      <Editor
                        filesTree={filesTree}
                        openedFiles={openedFiles}
                        activeFile={activeFile}
                        setActiveFile={setActiveFile}
                        closeFile={closeFile}
                        onCodeChange={handleCodeChange}
                      />
                      {/* Collaboration Pill */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0A0D14] border border-[#1E232B] shadow-lg shadow-black/50 rounded-full px-4 py-2 flex items-center gap-4 z-30">
                        <div className="flex -space-x-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-[#0A0D14] flex items-center justify-center text-[10px] font-bold text-white z-20">S</div>
                          <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-[#0A0D14] flex items-center justify-center text-[10px] font-bold text-white z-10">D</div>
                        </div>
                        <div className="w-px h-5 bg-[#30363D]"></div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Mic size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                          <PhoneOff size={14} />
                        </button>
                      </div>
                    </div>
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
