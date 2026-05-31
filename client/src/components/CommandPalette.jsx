import React, { useState, useEffect } from 'react';
import { Search, FileCode2, Terminal as TerminalIcon, Play, Bot, Phone, File as FileIcon, ChevronUp, ChevronDown, CornerDownLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      api.get('/projects')
        .then(res => setProjects(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected && selected.action) {
          selected.action();
        }
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, projects]);

  if (!isOpen) return null;

  // Map projects to commands
  const projectCommands = projects
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map(p => ({
      id: p._id,
      type: 'project',
      label: p.name,
      icon: <Folder size={14} className="text-blue-400" />,
      action: () => { onClose(); navigate(`/editor/${p._id}`); },
      details: {
        path: `workspace / ${p.name}`,
        size: `${(p.name.length * 1.5).toFixed(1)} KB`,
        modified: new Date(p.updatedAt || p.createdAt).toLocaleDateString(),
        content: `// Workspace configuration for ${p.name}\n{\n  "name": "${p.name}",\n  "owner": "${p.owner.username || 'System'}"\n}`
      }
    }));

  const staticCommands = [
    {
      id: 'action-build',
      type: 'action',
      label: 'Run Build',
      icon: <Play size={14} className="text-gray-400" />,
      shortcut: '⌘ B',
      action: () => onClose(),
      details: { path: 'System Command', content: 'Executes npm run build across the workspace.' }
    },
    {
      id: 'action-term',
      type: 'action',
      label: 'Open New Terminal',
      icon: <TerminalIcon size={14} className="text-gray-400" />,
      shortcut: '⌘ T',
      action: () => onClose(),
      details: { path: 'System Command', content: 'Opens a new zsh terminal instance in the current directory.' }
    },
    {
      id: 'collab-voice',
      type: 'collab',
      label: 'Start Voice Call with Team',
      icon: <Phone size={14} className="text-gray-400" />,
      action: () => onClose(),
      details: { path: 'Collaboration', content: 'Initiate a WebRTC voice call with active collaborators.' }
    },
    {
      id: 'ai-boiler',
      type: 'ai',
      label: 'Generate Boilerplate for API',
      icon: <Bot size={14} className="text-purple-400" />,
      action: () => onClose(),
      details: { path: 'Nexus AI', content: 'Creates a standard Express.js route and controller skeleton.' }
    }
  ];

  const allItems = [...projectCommands, ...staticCommands].filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
  const selectedItem = allItems[selectedIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-[850px] bg-[#0A0D14] border border-[#1E232B] rounded-xl shadow-2xl flex flex-col overflow-hidden font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#1E232B]">
          <Search size={16} className="text-gray-500 mr-3" />
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search... (Command + K)" 
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-500 font-medium"
          />
          <div className="px-2 py-1 bg-[#1E232B] rounded text-[10px] font-bold text-gray-400 border border-[#30363D]">
            ESC
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex h-[450px]">
          {/* Left Column (List) */}
          <div className="w-[300px] border-r border-[#1E232B] flex flex-col overflow-y-auto">
            
            {projectCommands.length > 0 && (
              <div className="pt-3 pb-1 px-3">
                <h4 className="text-[10px] font-bold tracking-wider text-gray-500 mb-1">RECENT PROJECTS</h4>
                {projectCommands.map((item, idx) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => { setSelectedIndex(allItems.findIndex(i => i.id === item.id)); item.action(); }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-[#11161D]'}`}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 pb-1 px-3">
              <h4 className="text-[10px] font-bold tracking-wider text-gray-500 mb-1">ACTIONS</h4>
              {staticCommands.filter(c => c.type === 'action').map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => { setSelectedIndex(allItems.findIndex(i => i.id === item.id)); item.action(); }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-[#11161D]'}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.shortcut && <span className="text-[10px] text-gray-500 font-mono tracking-widest">{item.shortcut}</span>}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 pb-1 px-3">
              <h4 className="text-[10px] font-bold tracking-wider text-gray-500 mb-1">COLLABORATORS</h4>
              {staticCommands.filter(c => c.type === 'collab').map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => { setSelectedIndex(allItems.findIndex(i => i.id === item.id)); item.action(); }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-[#11161D]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[8px] font-bold text-white shrink-0">S</div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 pb-1 px-3">
              <h4 className="text-[10px] font-bold tracking-wider text-gray-500 mb-1">AI</h4>
              {staticCommands.filter(c => c.type === 'ai').map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => { setSelectedIndex(allItems.findIndex(i => i.id === item.id)); item.action(); }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-purple-500/10 text-purple-400' : 'text-gray-300 hover:bg-[#11161D]'}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>

          {/* Right Column (Preview) */}
          <div className="flex-1 bg-[#11161D] p-5 flex flex-col">
            {selectedItem ? (
              <>
                <div className="flex items-start gap-3 mb-6">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg">
                    {selectedItem.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedItem.label}</h3>
                    <p className="text-xs text-gray-500">{selectedItem.details?.path}</p>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  {selectedItem.details?.size && (
                    <div className="bg-[#1E232B] rounded-lg p-3 flex-1 border border-[#30363D]">
                      <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">Size</p>
                      <p className="text-xs text-gray-200 font-mono">{selectedItem.details.size}</p>
                    </div>
                  )}
                  {selectedItem.details?.modified && (
                    <div className="bg-[#1E232B] rounded-lg p-3 flex-1 border border-[#30363D]">
                      <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">Last Modified</p>
                      <p className="text-xs text-gray-200 font-mono">{selectedItem.details.modified}</p>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-[#0A0D14] border border-[#1E232B] rounded-lg p-4 font-mono text-[11px] text-gray-300 whitespace-pre-wrap overflow-y-auto">
                  {selectedItem.details?.content}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1E232B]">
                  <button 
                    onClick={selectedItem.action}
                    className="flex-1 bg-blue-100 hover:bg-white text-blue-900 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    Open {selectedItem.type === 'project' ? 'Project' : 'Action'} <CornerDownLeft size={14} />
                  </button>
                  <button className="px-3 py-2 bg-[#1E232B] hover:bg-[#30363D] border border-[#30363D] rounded-lg text-gray-300 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                No item selected
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1E232B] px-4 py-2 flex items-center justify-between text-[10px] font-medium text-gray-500 bg-[#0A0D14]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="flex border border-[#30363D] bg-[#11161D] rounded px-1 gap-0.5">
                <ChevronUp size={10} /><ChevronDown size={10} />
              </span> Navigate
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex border border-[#30363D] bg-[#11161D] rounded px-1">
                <CornerDownLeft size={10} />
              </span> Select
            </div>
          </div>
          <span>Nexus Command Center v2.4</span>
        </div>
      </div>
    </div>
  );
};

// Need Folder import
import { Folder } from 'lucide-react';

export default CommandPalette;
