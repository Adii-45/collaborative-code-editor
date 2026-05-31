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
    <div className="h-full w-full bg-[#11161D] overflow-hidden flex flex-col border-t border-[#1E232B]">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#11161D] text-gray-400 text-xs border-b border-[#1E232B] shrink-0 pt-2 px-2">
        <div className="flex items-center gap-4">
          <button className="px-2 py-1.5 border-b-2 border-transparent hover:text-gray-200 uppercase tracking-wider font-medium text-[10px]">
            Terminal
          </button>
          <button className="px-2 py-1.5 border-b-2 border-blue-500 text-blue-400 uppercase tracking-wider font-medium text-[10px]">
            Output
          </button>
          <button className="px-2 py-1.5 border-b-2 border-transparent hover:text-gray-200 uppercase tracking-wider font-medium text-[10px]">
            Problems (0)
          </button>
          {isRunning && (
            <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-600/20 text-green-400 border border-green-600/30 rounded">
              Running
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-[#1E232B] rounded transition-colors mb-1"
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
