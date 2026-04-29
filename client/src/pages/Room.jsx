import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Navbar from '../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import Terminal from '../components/Terminal';
import { initialFileSystem, updateFileContent, addNode, deleteNode, renameNode, moveNode } from '../utils/defaultFiles';

const Room = () => {
  const [filesTree, setFilesTree] = useState(initialFileSystem);
  const [activeFile, setActiveFile] = useState(null);
  const [openedFiles, setOpenedFiles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleCodeChange = (id, newCode) => {
    setFilesTree(prev => updateFileContent(prev, id, newCode));
  };

  const openFile = (id) => {
    if (!openedFiles.includes(id)) {
      setOpenedFiles(prev => [...prev, id]);
    }
    setActiveFile(id);
  };

  const closeFile = (id) => {
    const newOpened = openedFiles.filter(f => f !== id);
    setOpenedFiles(newOpened);
    if (activeFile === id) {
      setActiveFile(newOpened.length > 0 ? newOpened[newOpened.length - 1] : null);
    }
  };

  const handleCreateNode = (parentId, name, type) => {
    const newNode = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      type
    };
    if (type === 'folder') newNode.children = [];
    else newNode.content = '';
    
    setFilesTree(prev => addNode(prev, parentId, newNode));
    if (type === 'file') {
      openFile(newNode.id);
    }
  };

  const handleDeleteNode = (id) => {
    setFilesTree(prev => deleteNode(prev, id));
    closeFile(id);
  };

  const handleRenameNode = (id, newName) => {
    setFilesTree(prev => renameNode(prev, id, newName));
  };

  const handleMoveNode = (id, newParentId) => {
    setFilesTree(prev => moveNode(prev, id, newParentId));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e]">
      <Navbar 
        isRunning={isRunning}
        toggleRun={() => setIsRunning(!isRunning)}
        toggleTerminal={() => setShowTerminal(!showTerminal)}
        showTerminal={showTerminal}
      />
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15}>
            <FileExplorer 
              filesTree={filesTree} 
              activeFile={activeFile} 
              setActiveFile={setActiveFile} 
              openFile={openFile}
              onCreateNode={handleCreateNode}
              onDeleteNode={handleDeleteNode}
              onRenameNode={handleRenameNode}
              onMoveNode={handleMoveNode}
            />
          </Panel>
          <PanelResizeHandle className="w-1 bg-[#30363d] hover:bg-blue-500 transition-colors cursor-col-resize" />
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={showTerminal ? 70 : 100}>
                <Editor 
                  filesTree={filesTree} 
                  openedFiles={openedFiles}
                  activeFile={activeFile} 
                  setActiveFile={setActiveFile}
                  closeFile={closeFile}
                  onCodeChange={handleCodeChange} 
                />
              </Panel>
              {showTerminal && (
                <>
                  <PanelResizeHandle className="h-1 bg-[#30363d] hover:bg-blue-500 transition-colors cursor-row-resize z-10" />
                  <Panel defaultSize={30} minSize={15}>
                    <Terminal />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="w-1 bg-[#30363d] hover:bg-blue-500 transition-colors cursor-col-resize" />
          <Panel defaultSize={30} minSize={20}>
            <Preview filesTree={filesTree} isRunning={isRunning} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Room;
