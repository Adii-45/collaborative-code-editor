import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Plus, X } from 'lucide-react';
import api from '../utils/api';
import 'xterm/css/xterm.css';

/**
 * TerminalWindow: A single xterm.js instance that sends commands
 * to the backend API for execution.
 */
const TerminalWindow = ({ id, isActive }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Delay init to ensure DOM is painted with valid dimensions
    const initTimer = setTimeout(() => {
      if (!terminalRef.current) return;

      const term = new XTerm({
        theme: {
          background: '#1e1e1e',
          foreground: '#cccccc',
          cursor: '#ffffff',
          selectionBackground: '#264f78',
        },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        cursorBlink: true,
      });

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      try { fitAddon.fit(); } catch (e) {}

      term.writeln('\x1b[1;34m═══ Code Editor Terminal ═══\x1b[0m');
      term.writeln('\x1b[90mType "help" for available commands.\x1b[0m');
      term.writeln('');
      term.write('$ ');

      let command = '';
      let isExecuting = false;

      term.onData(async (data) => {
        // Block input while a command is running
        if (isExecuting) return;

        const char = data;

        if (char === '\r') {
          // Enter: execute command
          term.write('\r\n');
          const cmd = command.trim();

          if (cmd === '') {
            term.write('$ ');
            command = '';
            return;
          }

          if (cmd === 'clear') {
            term.clear();
            term.write('$ ');
            command = '';
            return;
          }

          // Send command to backend
          isExecuting = true;
          try {
            const { data: result } = await api.post('/terminal/execute', { command: cmd });

            if (result.clear) {
              term.clear();
            } else {
              if (result.stdout) {
                term.writeln(result.stdout);
              }
              if (result.stderr) {
                term.writeln(`\x1b[31m${result.stderr}\x1b[0m`);
              }
            }
          } catch (error) {
            const msg = error.response?.data?.message || 'Command execution failed';
            term.writeln(`\x1b[31mError: ${msg}\x1b[0m`);
          }

          isExecuting = false;
          command = '';
          term.write('$ ');
        } else if (char === '\x7F') {
          // Backspace
          if (command.length > 0) {
            command = command.slice(0, -1);
            term.write('\b \b');
          }
        } else if (char >= String.fromCharCode(0x20) && char <= String.fromCharCode(0x7E)) {
          // Printable characters
          command += char;
          term.write(char);
        }
      });

      xtermRef.current = term;
    }, 50);

    return () => {
      clearTimeout(initTimer);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [id]);

  // Fit when it becomes active
  useEffect(() => {
    if (isActive && fitAddonRef.current) {
      setTimeout(() => {
        try { fitAddonRef.current.fit(); } catch (e) {}
      }, 50);
    }
  }, [isActive]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (isActive && fitAddonRef.current) {
        try { fitAddonRef.current.fit(); } catch (e) {}
      }
    });
    if (terminalRef.current) observer.observe(terminalRef.current);

    return () => observer.disconnect();
  }, [isActive]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full"
      style={{ display: isActive ? 'block' : 'none' }}
    />
  );
};

/**
 * Terminal: Multi-tab terminal wrapper.
 */
const Terminal = () => {
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
      <div className="flex-1 p-2 relative h-full w-full">
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Terminal;
