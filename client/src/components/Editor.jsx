import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { X } from 'lucide-react';
import { findNode } from '../utils/defaultFiles';

const Editor = ({ filesTree, openedFiles, activeFile, setActiveFile, closeFile, onCodeChange }) => {
  const getLanguage = (filename) => {
    if (!filename) return 'plaintext';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.cpp') || filename.endsWith('.c')) return 'cpp';
    if (filename.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const handleEditorChange = (value) => {
    if (activeFile) {
      onCodeChange(activeFile, value || '');
    }
  };

  const activeNode = activeFile ? findNode(filesTree, activeFile) : null;
  const activeContent = activeNode ? activeNode.content : '';

  return (
    <div className="h-full w-full flex flex-col bg-[#0A0D14] border-r border-[#1E232B] overflow-hidden">
      <div className="flex bg-[#11161D] text-gray-300 text-sm overflow-x-auto scrollbar-hide border-b border-[#1E232B] shrink-0">
        {openedFiles.map(filePath => {
          const node = findNode(filesTree, filePath);
          const name = node ? node.name : filePath.split('/').pop();
          const isActive = filePath === activeFile;
          
          return (
            <div 
              key={filePath}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-[#1E232B] min-w-max group ${
                isActive ? 'bg-[#0A0D14] border-t-2 border-t-blue-500 text-white' : 'bg-[#11161D] border-t-2 border-t-transparent hover:bg-[#1E232B]'
              }`}
              onClick={() => setActiveFile(filePath)}
            >
              <span>{name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); closeFile(filePath); }}
                className={`p-0.5 rounded hover:bg-[#30363D] ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex-1">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            language={getLanguage(activeFile)}
            theme="vs-dark"
            value={activeContent}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">No file open</p>
            <p className="text-sm opacity-70">Create a file to start coding</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
