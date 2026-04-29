import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Square, Share2, Code2, Terminal as TerminalIcon, ArrowLeft, LogOut, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ isRunning, toggleRun, toggleTerminal, showTerminal, projectName, connectedUsers, projectId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleShare = () => {
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success('Project URL copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 shrink-0">
      {/* Left: Back + Logo + Project Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="bg-blue-600 p-1.5 rounded-md">
          <Code2 size={18} className="text-white" />
        </div>
        <span className="font-semibold text-sm tracking-wide text-gray-200">
          {projectName || 'Untitled Project'}
        </span>
        {/* Connected users indicator */}
        {connectedUsers?.length > 1 && (
          <div className="flex items-center gap-1.5 ml-2 bg-[#21262d] border border-[#30363d] px-2.5 py-1 rounded-full">
            <Users size={12} className="text-green-400" />
            <span className="text-xs text-gray-300">{connectedUsers.length} online</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleRun}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-medium rounded-md transition-colors ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? <Square size={14} className="fill-current" /> : <Play size={16} />}
          <span>{isRunning ? 'Stop' : 'Run'}</span>
        </button>
        <button
          onClick={toggleTerminal}
          className={`flex items-center gap-1.5 px-3 py-1.5 border text-sm font-medium rounded-md transition-colors ${
            showTerminal
              ? 'bg-[#30363d] border-[#30363d] text-white'
              : 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-gray-300 hover:text-white'
          }`}
        >
          <TerminalIcon size={16} />
          <span>Terminal</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 hover:text-white text-sm font-medium rounded-md transition-colors"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>

        {/* User & Logout */}
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-[#30363d]">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
