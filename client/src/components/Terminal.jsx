import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import api from '../utils/api';

const TerminalWindow = ({ id, isActive, projectId }) => {
  const [logs, setLogs] = useState([
    { type: 'info', text: '═══ Code Editor Terminal ═══' },
    { type: 'info', text: 'Type "help" for available commands.' },
    { type: 'info', text: 'Allowed commands: ls, pwd, npm install, node <file>' },
    { type: 'info', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Focus input when terminal becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input.trim();
      
      if (!cmd) {
        setLogs(prev => [...prev, { type: 'command', text: '$ ' }]);
        return;
      }

      if (cmd === 'clear') {
        setLogs([]);
        setInput('');
        return;
      }

      // Add to logs and history
      setLogs(prev => [...prev, { type: 'command', text: `$ ${cmd}` }]);
      setHistory(prev => [cmd, ...prev]);
      setHistoryIndex(-1);
      setInput('');
      setIsExecuting(true);

      try {
        const { data: result } = await api.post('/terminal/run', { command: cmd, projectId });
        
        if (result.stdout) {
          setLogs(prev => [...prev, { type: 'stdout', text: result.stdout }]);
        }
        if (result.stderr) {
          setLogs(prev => [...prev, { type: 'stderr', text: result.stderr }]);
        }
        if (!result.stdout && !result.stderr && result.exitCode === 0) {
           // Provide some feedback if command succeeds silently (like 'npm install' might if suppressed, though it usually outputs)
           // Or just leave empty
        }
      } catch (error) {
        const msg = error.response?.data?.message || error.message || 'Execution failed';
        setLogs(prev => [...prev, { type: 'error', text: `Error: ${msg}` }]);
      } finally {
        setIsExecuting(false);
        // Refocus input
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col font-mono text-[14px] leading-tight"
      style={{ display: isActive ? 'flex' : 'none' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-3 text-gray-300">
        {logs.map((log, i) => (
          <div key={i} className="mb-1 whitespace-pre-wrap word-break">
            {log.type === 'command' && <span className="text-white">{log.text}</span>}
            {log.type === 'stdout' && <span>{log.text}</span>}
            {log.type === 'stderr' && <span className="text-red-400">{log.text}</span>}
            {log.type === 'error' && <span className="text-red-500 font-bold">{log.text}</span>}
            {log.type === 'info' && <span className="text-blue-400 font-bold">{log.text}</span>}
          </div>
        ))}
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-green-400 font-bold">$</span>
          {isExecuting ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              <span>Running...</span>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none border-none text-white focus:ring-0 p-0 m-0"
              spellCheck={false}
              autoComplete="off"
            />
          )}
        </div>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

const Terminal = ({ projectId }) => {
  const [terminals, setTerminals] = useState([{ id: 1, name: 'bash' }]);
  const [activeId, setActiveId] = useState(1);
  const [nextId, setNextId] = useState(2);

  const addTerminal = () => {
    const newId = nextId;
    setTerminals([...terminals, { id: newId, name: 'bash' }]);
    setActiveId(newId);
    setNextId(newId + 1);
  };

  const removeTerminal = (id) => {
    const newTerminals = terminals.filter(t => t.id !== id);
    setTerminals(newTerminals);
    if (activeId === id) {
      setActiveId(newTerminals.length > 0 ? newTerminals[newTerminals.length - 1].id : null);
    }
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden flex flex-col border-t border-[#30363d]">
      <div className="flex bg-[#252526] text-gray-400 text-xs overflow-x-auto scrollbar-hide border-b border-[#30363d] shrink-0">
        <div className="flex items-center px-3 py-1 font-semibold uppercase tracking-wider border-r border-[#30363d]">
          Terminal
        </div>
        {terminals.map(t => (
          <div
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer border-r border-[#30363d] min-w-max group ${
              activeId === t.id ? 'bg-[#1e1e1e] border-t border-t-blue-500 text-white' : 'bg-[#2d2d2d] border-t border-t-transparent hover:bg-[#2a2d2e]'
            }`}
          >
            <span>{t.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); removeTerminal(t.id); }}
              className={`p-0.5 rounded hover:bg-[#3c3c3c] ${activeId === t.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
      <div className="flex-1 relative h-full w-full bg-[#1e1e1e]">
        {terminals.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500 text-sm">
            No active terminals. Click + to create one.
          </div>
        ) : (
          terminals.map(t => (
            <TerminalWindow
              key={t.id}
              id={t.id}
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
