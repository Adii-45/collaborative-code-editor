import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, Bell, Settings, ChevronRight, Folder, FileCode2, Play, Square } from 'lucide-react';
import InviteModal from './InviteModal';
import CommitModal from './CommitModal';

const Navbar = ({ isRunning, toggleRun, toggleTerminal, showTerminal, projectName, connectedUsers, projectId, project, activeFile, filesTree }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);

  // Helper to find path to active file
  const getFilePath = (node, targetId, path = []) => {
    if (!node) return null;
    
    // Skip adding the root node itself to breadcrumbs to keep UI clean,
    // unless you want "root > src > App.js". Let's skip it if name is "root".
    const currentPath = node.name === 'root' ? path : [...path, node];

    if (node.id === targetId) return currentPath;
    
    if (node.children) {
      for (const child of node.children) {
        const found = getFilePath(child, targetId, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const breadcrumbs = getFilePath(filesTree, activeFile) || [];

  return (
    <>
      <nav className="h-12 bg-[#0A0D14] border-b border-[#1E232B] flex items-center justify-between px-4 shrink-0 font-sans">
        
        {/* Left: Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer w-48"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <span className="font-semibold text-sm tracking-wide text-gray-200">
            Nexus IDE
          </span>
        </div>

        {/* Middle: Breadcrumbs */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center text-xs text-gray-400 font-medium">
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((node, index) => (
                <React.Fragment key={node.id}>
                  {index > 0 && <ChevronRight size={14} className="mx-1 text-gray-600" />}
                  <div className={`flex items-center gap-1.5 ${index === breadcrumbs.length - 1 ? 'text-gray-200' : 'hover:text-gray-300 cursor-pointer'}`}>
                    {node.type === 'folder' ? <Folder size={14} /> : <FileCode2 size={14} />}
                    <span>{node.name}</span>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Folder size={14} />
                <span>{projectName || 'Workspace'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Users */}
        <div className="flex items-center justify-end gap-4 w-64">
          
          {/* Connected Users */}
          {connectedUsers && connectedUsers.length > 0 && (
            <div className="flex -space-x-1.5">
              {connectedUsers.slice(0, 3).map((u, i) => {
                const initials = u.username ? u.username.charAt(0).toUpperCase() : 'U';
                return (
                  <div 
                    key={i} 
                    className="w-6 h-6 rounded-full bg-blue-900 border-2 border-[#0A0D14] flex items-center justify-center text-[10px] font-bold text-blue-200 z-10"
                    title={u.username}
                  >
                    {initials}
                  </div>
                );
              })}
              {connectedUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-[#1E232B] border-2 border-[#0A0D14] flex items-center justify-center text-[10px] font-bold text-gray-400 z-0">
                  +{connectedUsers.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Run/Deploy Button */}
          <button
            onClick={toggleRun}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors ${
              isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? <Square size={14} className="fill-current" /> : <Rocket size={14} />}
            <span>{isRunning ? 'Stop' : 'Deploy'}</span>
          </button>

          {/* Icons */}
          <div className="flex items-center gap-1 text-gray-400">
            <button className="p-1.5 hover:text-white hover:bg-[#1E232B] rounded-md transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#0A0D14]"></span>
            </button>
            <button className="p-1.5 hover:text-white hover:bg-[#1E232B] rounded-md transition-colors">
              <Settings size={16} />
            </button>
          </div>
          
          {/* User Avatar */}
          <button className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ml-1">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </button>

        </div>
      </nav>

      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        project={project}
        user={user}
      />
      <CommitModal 
        isOpen={isCommitModalOpen} 
        onClose={() => setIsCommitModalOpen(false)} 
        projectId={projectId} 
      />
    </>
  );
};

export default Navbar;
