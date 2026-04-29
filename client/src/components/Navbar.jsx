import React from 'react';
import { Play, Square, Share2, Code2, Terminal as TerminalIcon } from 'lucide-react';

const Navbar = ({ isRunning, toggleRun, toggleTerminal, showTerminal }) => {
  return (
    <nav className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-md">
          <Code2 size={20} className="text-white" />
        </div>
        <span className="font-semibold text-sm tracking-wide">Real-time Editor</span>
      </div>
      
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
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 hover:text-white text-sm font-medium rounded-md transition-colors">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
