import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';

/**
 * OutputConsole: Read-only console that displays streamed run:log output.
 * Replaces the old simulated terminal.
 *
 * Props:
 *   logs      - Array of { type: 'stdout' | 'stderr' | 'info', message: string }
 *   onClear   - Callback to clear the log buffer
 *   isRunning - Whether a process is currently running
 */
const OutputConsole = ({ logs = [], onClear, isRunning }) => {
  const endRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLineStyle = (type) => {
    switch (type) {
      case 'stderr': return 'text-red-400';
      case 'info':   return 'text-blue-400';
      default:       return 'text-gray-300';
    }
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden flex flex-col border-t border-[#30363d]">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#252526] text-gray-400 text-xs border-b border-[#30363d] shrink-0 px-3 py-1.5">
        <div className="flex items-center gap-2 font-semibold uppercase tracking-wider">
          <TerminalIcon size={14} />
          <span>Output Console</span>
          {isRunning && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-600/20 text-green-400 border border-green-600/30 rounded">
              Running
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-[#3c3c3c] rounded transition-colors"
          title="Clear Output"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Log output area */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[13px] leading-5">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">
            Click Run to execute project
          </div>
        ) : (
          logs.map((entry, i) => (
            <div key={i} className={`whitespace-pre-wrap break-all ${getLineStyle(entry.type)}`}>
              {entry.message}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default OutputConsole;
