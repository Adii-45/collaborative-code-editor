import React from 'react';
import { RefreshCw, Play } from 'lucide-react';

const Preview = ({ filesTree, isRunning, previewUrl }) => {
  const [key, setKey] = React.useState(0);

  const handleRefresh = () => {
    if (isRunning && previewUrl) {
      setKey(prev => prev + 1);
    }
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col border-l border-[#30363d]">
      <div className="h-10 bg-[#252526] border-b border-[#30363d] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="ml-4 bg-[#1e1e1e] border border-[#30363d] rounded text-xs px-3 py-1 text-gray-400 font-mono flex items-center gap-2">
            <span>{previewUrl ? new URL(previewUrl).host : 'localhost:----'}</span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className={`text-gray-400 hover:text-white transition-colors ${(!isRunning || !previewUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Refresh Preview"
          disabled={!isRunning || !previewUrl}
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="flex-1 bg-white relative">
        {isRunning && previewUrl ? (
          <iframe
            key={key}
            src={previewUrl}
            title="preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="w-full h-full border-none absolute inset-0 bg-white"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] text-gray-500">
            <Play size={48} className="mb-4 opacity-20" />
            <p>{isRunning ? "Running (No preview available for this project type)" : "Click Run to start project"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
