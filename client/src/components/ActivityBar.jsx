import React from 'react';
import { Folder, Search, GitBranch, Play, Bot, User, Settings } from 'lucide-react';

const ActivityBar = () => {
  return (
    <div className="w-14 h-full bg-[#11161D] border-r border-[#1E232B] flex flex-col items-center py-4 shrink-0 z-10 flex-shrink-0">
      <div className="flex flex-col gap-6 w-full items-center">
        <button className="text-blue-500 relative p-2 group w-full flex justify-center">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-500 rounded-r-full"></div>
          <Folder size={24} strokeWidth={1.5} />
        </button>
        <button className="text-gray-500 hover:text-gray-300 p-2 transition-colors">
          <Search size={24} strokeWidth={1.5} />
        </button>
        <button className="text-gray-500 hover:text-gray-300 p-2 transition-colors">
          <GitBranch size={24} strokeWidth={1.5} />
        </button>
        <button className="text-gray-500 hover:text-gray-300 p-2 transition-colors">
          <Play size={24} strokeWidth={1.5} />
        </button>
        <button className="text-gray-500 hover:text-gray-300 p-2 transition-colors">
          <Bot size={24} strokeWidth={1.5} />
        </button>
      </div>
      
      <div className="mt-auto flex flex-col gap-6 w-full items-center">
        <button className="text-gray-500 hover:text-gray-300 p-2 transition-colors">
          <User size={24} strokeWidth={1.5} />
        </button>
        <button className="text-gray-500 hover:text-gray-300 p-2 transition-colors">
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
