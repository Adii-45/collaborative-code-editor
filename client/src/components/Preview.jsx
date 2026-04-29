import React, { useState, useEffect } from 'react';
import { RefreshCw, Play } from 'lucide-react';
import { getAllFiles } from '../utils/defaultFiles';

const Preview = ({ filesTree, isRunning }) => {
  const [srcDoc, setSrcDoc] = useState('');

  const generateSrcDoc = () => {
    const allFiles = getAllFiles(filesTree);
    
    // Find first html, css, js files in the tree
    const htmlFile = allFiles.find(f => f.name.endsWith('.html'))?.content || '';
    const cssFile = allFiles.find(f => f.name.endsWith('.css'))?.content || '';
    const jsFile = allFiles.find(f => f.name.endsWith('.js'))?.content || '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssFile}</style>
        </head>
        <body>
          ${htmlFile}
          <script>${jsFile}</script>
        </body>
      </html>
    `;
  };

  useEffect(() => {
    if (isRunning) {
      setSrcDoc(generateSrcDoc());
    } else {
      setSrcDoc('');
    }
  }, [isRunning]); // No longer listening to file changes, only start/stop triggers

  const handleRefresh = () => {
    if (isRunning) {
      setSrcDoc(generateSrcDoc());
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
            <span>localhost:3000</span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className={`text-gray-400 hover:text-white transition-colors ${!isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Refresh Preview"
          disabled={!isRunning}
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="flex-1 bg-white relative">
        {isRunning ? (
          <iframe
            srcDoc={srcDoc}
            title="preview"
            sandbox="allow-scripts"
            className="w-full h-full border-none absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] text-gray-500">
            <Play size={48} className="mb-4 opacity-20" />
            <p>Click Run to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
