import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, Terminal as TerminalIcon } from 'lucide-react';
import api from '../utils/api';

/**
 * TerminalWindow: A simple simulated backend-driven terminal.
 */
const TerminalWindow = ({ tabId, isActive, projectId }) => {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Simulated Terminal Session Started.' },
    { type: 'output', text: 'Type a command and press Enter.' }
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on history change
  useEffect(() => {
    if (endRef.current && isActive) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isActive]);

  // Focus input when tab becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const executeCommand = async () => {
    if (!input.trim() || isExecuting) return;

    const command = input.trim();
    setInput('');
    setIsExecuting(true);

    // Add input to history
    setHistory(prev => [...prev, { type: 'input', text: command }]);

    if (command === 'clear') {
      setHistory([]);
      setIsExecuting(false);
      return;
    }

    try {
      const { data } = await api.post('/terminal/run', {
        command,
        projectId
      });

      if (data.stdout) {
        setHistory(prev => [...prev, { type: 'output', text: data.stdout }]);
      }
      if (data.stderr) {
        setHistory(prev => [...prev, { type: 'error', text: data.stderr }]);
      }
      if (!data.stdout && !data.stderr) {
        // Just empty newline if command succeeded silently
        setHistory(prev => [...prev, { type: 'output', text: '' }]);
      }
    } catch (error) {
      setHistory(prev => [
        ...prev,
        { type: 'error', text: `Failed to execute: ${error.message}` }
      ]);
    } finally {
      setIsExecuting(false);
      // Refocus input
      setTimeout(() => {
        if (inputRef.current && isActive) inputRef.current.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'l' && e.ctrlKey) {
      // Ctrl+L to clear
      e.preventDefault();
      setHistory([]);
    }
  };

  return (
    <div
      className="w-full h-full relative flex flex-col font-mono text-[13px] bg-[#1e1e1e] p-2 overflow-y-auto"
      style={{ display: isActive ? 'flex' : 'none' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 text-gray-300">
        {history.map((item, i) => (
          <div key={i} className="mb-1 whitespace-pre-wrap break-all">
            {item.type === 'input' && (
              <div className="flex gap-2">
                <span className="text-green-400">~/app $</span>
                <span className="text-white">{item.text}</span>
              </div>
            )}
            {item.type === 'output' && item.text && (
              <div className="text-gray-300 ml-2">{item.text}</div>
            )}
            {item.type === 'error' && item.text && (
              <div className="text-red-400 ml-2">{item.text}</div>
            )}
          </div>
        ))}
        
        {/* Current Input Row */}
        <div className="flex gap-2 mt-1 items-center">
          <span className="text-green-400 shrink-0">~/app $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 p-0 m-0 w-full disabled:opacity-50"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
      <div ref={endRef} />
    </div>
  );
};

/**
 * Terminal: Multi-tab terminal wrapper for the simulated backend terminal.
 */
const Terminal = ({ projectId }) => {
  const [terminals, setTerminals] = useState([{ id: 1, name: 'bash' }]);
  const [activeId, setActiveId] = useState(1);
  const [nextId, setNextId] = useState(2);

  const addTerminal = () => {
    const newId = nextId;
    setTerminals(prev => [...prev, { id: newId, name: 'bash' }]);
    setActiveId(newId);
    setNextId(newId + 1);
  };

  const removeTerminal = (id) => {
    setTerminals(prev => {
      const newTerminals = prev.filter(t => t.id !== id);
      if (activeId === id) {
        setActiveId(newTerminals.length > 0 ? newTerminals[newTerminals.length - 1].id : null);
      }
      return newTerminals;
    });
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden flex flex-col border-t border-[#30363d]">
      {/* Tab bar */}
      <div className="flex bg-[#252526] text-gray-400 text-xs overflow-x-auto scrollbar-hide border-b border-[#30363d] shrink-0">
        <div className="flex items-center px-3 py-1 font-semibold uppercase tracking-wider border-r border-[#30363d]">
          <TerminalIcon size={14} className="mr-2" /> Terminal
        </div>
        {terminals.map(t => (
          <div
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer border-r border-[#30363d] min-w-max group ${
              activeId === t.id
                ? 'bg-[#1e1e1e] border-t border-t-blue-500 text-white'
                : 'bg-[#2d2d2d] border-t border-t-transparent hover:bg-[#2a2d2e]'
            }`}
          >
            <span>{t.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); removeTerminal(t.id); }}
              className={`p-0.5 rounded hover:bg-[#3c3c3c] ${
                activeId === t.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={addTerminal}
          className="flex items-center justify-center px-3 hover:bg-[#2a2d2e] transition-colors"
          title="New Terminal"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Terminal content */}
      <div className="flex-1 relative h-full w-full bg-[#1e1e1e]">
        {terminals.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500 text-sm">
            No active terminals. Click + to create one.
          </div>
        ) : (
          terminals.map(t => (
            <TerminalWindow
              key={t.id}
              tabId={t.id}
              isActive={activeId === t.id}
              projectId={projectId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Terminal;
