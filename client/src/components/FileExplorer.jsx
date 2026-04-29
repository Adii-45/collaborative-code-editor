import React, { useState } from 'react';
import { FilePlus, FolderPlus, RefreshCw, ChevronRight, ChevronDown, Folder, File as FileIcon, Trash2, Edit2 } from 'lucide-react';
import { SiJavascript, SiHtml5, SiCss, SiPython, SiCplusplus, SiJson, SiTypescript } from 'react-icons/si';
import { DndContext, useDraggable, useDroppable, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { findNode, findParent } from '../utils/defaultFiles';

const getFileIcon = (filename) => {
  if (filename.endsWith('.html')) return <SiHtml5 size={14} className="text-orange-500" />;
  if (filename.endsWith('.css')) return <SiCss size={14} className="text-blue-500" />;
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return <SiJavascript size={14} className="text-yellow-400" />;
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <SiTypescript size={14} className="text-blue-600" />;
  if (filename.endsWith('.json')) return <SiJson size={14} className="text-yellow-200" />;
  if (filename.endsWith('.py')) return <SiPython size={14} className="text-blue-400" />;
  if (filename.endsWith('.cpp') || filename.endsWith('.c')) return <SiCplusplus size={14} className="text-blue-600" />;
  return <FileIcon size={14} className="text-gray-400" />;
};

const FileNode = ({ 
  node, level, activeFile, onFileClick, onRename, onDelete, onCreateNode,
  creatingNode, setCreatingNode
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  
  const isFolder = node.type === 'folder';

  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: { type: node.type, node }
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: node.id,
    data: { type: node.type, node }
  });

  const setRefs = (element) => {
    setDraggableRef(element);
    if (isFolder) setDroppableRef(element);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const handleRenameSubmit = (e) => {
    if (e.key === 'Enter') {
      if (editName.trim()) onRename(node.id, editName.trim());
      setIsRenaming(false);
    } else if (e.key === 'Escape') {
      setEditName(node.name);
      setIsRenaming(false);
    }
  };

  const validateName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Name cannot be empty';
    if (node.children && node.children.some(c => c.name === trimmed)) return 'File already exists';
    return '';
  };

  const submitCreate = (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setCreatingNode(null);
      setCreateName('');
      setCreateError('');
      return false;
    }
    const error = validateName(name);
    if (error) {
      setCreateError(error);
      return false;
    }
    onCreateNode(node.id, trimmed, creatingNode.type);
    setCreatingNode(null);
    setCreateName('');
    setCreateError('');
    return true;
  };

  const handleCreateKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitCreate(createName);
    } else if (e.key === 'Escape') {
      setCreatingNode(null);
      setCreateName('');
      setCreateError('');
    }
  };

  const handleCreateBlur = () => {
    if (createName.trim()) {
      submitCreate(createName);
    } else {
      setCreatingNode(null);
      setCreateName('');
      setCreateError('');
    }
  };

  const handleCreateInline = (e, type) => {
    e.stopPropagation();
    setIsOpen(true);
    setCreateName('');
    setCreateError('');
    setCreatingNode({ parentId: node.id, type });
  };

  const isCreatingHere = creatingNode?.parentId === node.id;

  return (
    <div ref={setRefs} style={style}>
      <div
        onClick={() => {
          if (isFolder) setIsOpen(!isOpen);
          else onFileClick(node.id);
        }}
        {...listeners}
        {...attributes}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        className={`w-full flex items-center justify-between group py-1 text-sm transition-colors cursor-pointer ${
          activeFile === node.id 
            ? 'bg-[#37373d] text-white' 
            : isOver ? 'bg-[#2a2d2e] ring-1 ring-blue-500' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
        }`}
      >
        <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
          {isFolder ? (
            <>
              {isOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
              <Folder size={14} className="text-blue-400 shrink-0" />
            </>
          ) : (
            <>
              <span className="w-4 shrink-0"></span>
              <span className="w-4 flex justify-center shrink-0">{getFileIcon(node.name)}</span>
            </>
          )}

          {isRenaming ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={handleRenameSubmit}
              onBlur={() => setIsRenaming(false)}
              className="bg-[#3c3c3c] text-white px-1 outline-none border border-blue-500 w-full text-xs"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="truncate" onDoubleClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}>
              {node.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 pr-2 shrink-0">
          {isFolder && (
            <>
              <button onClick={(e) => handleCreateInline(e, 'file')} className="hover:text-white p-0.5"><FilePlus size={12} /></button>
              <button onClick={(e) => handleCreateInline(e, 'folder')} className="hover:text-white p-0.5"><FolderPlus size={12} /></button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} className="hover:text-white p-0.5"><Edit2 size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="hover:text-red-400 p-0.5"><Trash2 size={12} /></button>
        </div>
      </div>

      {isOpen && isFolder && (
        <div>
          {isCreatingHere && (
            <div style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }} className="flex flex-col py-1">
              <div className="flex items-center gap-2">
                {creatingNode.type === 'folder' ? <Folder size={14} className="text-blue-400 shrink-0" /> : <FileIcon size={14} className="text-gray-400 shrink-0" />}
                <input
                  autoFocus
                  value={createName}
                  onChange={e => {
                    setCreateName(e.target.value);
                    setCreateError('');
                  }}
                  onKeyDown={handleCreateKeyDown}
                  onBlur={handleCreateBlur}
                  className={`bg-[#3c3c3c] text-white px-1 outline-none border w-full text-xs ${createError ? 'border-red-500' : 'border-blue-500'}`}
                  placeholder={`New ${creatingNode.type}...`}
                />
              </div>
              {createError && <span className="text-red-400 text-[10px] ml-6 mt-0.5">{createError}</span>}
            </div>
          )}
          {node.children && node.children.map((child) => (
            <FileNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              activeFile={activeFile} 
              onFileClick={onFileClick}
              onRename={onRename}
              onDelete={onDelete}
              onCreateNode={onCreateNode}
              creatingNode={creatingNode}
              setCreatingNode={setCreatingNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ filesTree, activeFile, setActiveFile, openFile, onCreateNode, onDeleteNode, onRenameNode, onMoveNode }) => {
  const [creatingNode, setCreatingNode] = useState(null); // { parentId, type }
  const [rootCreateName, setRootCreateName] = useState('');
  const [rootCreateError, setRootCreateError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onMoveNode(active.id, over.id);
    }
  };

  const handleFileClick = (id) => {
    openFile(id);
    setActiveFile(id);
  };

  const getTargetFolderId = () => {
    if (!activeFile) return 'root';
    const activeNode = findNode(filesTree, activeFile);
    if (activeNode && activeNode.type === 'folder') return activeNode.id;
    const parent = findParent(filesTree, activeFile);
    return parent ? parent.id : 'root';
  };

  const handleGlobalCreate = (type) => {
    const targetId = getTargetFolderId();
    setCreatingNode({ parentId: targetId, type });
    setRootCreateName('');
    setRootCreateError('');
  };

  const validateRootName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Name cannot be empty';
    if (filesTree.children && filesTree.children.some(c => c.name === trimmed)) return 'File already exists';
    return '';
  };

  const submitRootCreate = (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setCreatingNode(null);
      setRootCreateName('');
      setRootCreateError('');
      return false;
    }
    const error = validateRootName(name);
    if (error) {
      setRootCreateError(error);
      return false;
    }
    onCreateNode('root', trimmed, creatingNode.type);
    setCreatingNode(null);
    setRootCreateName('');
    setRootCreateError('');
    return true;
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="h-full w-full bg-[#181818] flex flex-col select-none">
        <div className="px-4 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <button onClick={() => handleGlobalCreate('file')} className="hover:text-white" title="New File">
              <FilePlus size={14} />
            </button>
            <button onClick={() => handleGlobalCreate('folder')} className="hover:text-white" title="New Folder">
              <FolderPlus size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2 overflow-x-hidden">
          {creatingNode?.parentId === 'root' && (
            <div className="flex flex-col py-1 px-4">
              <div className="flex items-center gap-2">
                {creatingNode.type === 'folder' ? <Folder size={14} className="text-blue-400 shrink-0" /> : <FileIcon size={14} className="text-gray-400 shrink-0" />}
                <input
                  autoFocus
                  value={rootCreateName}
                  onChange={e => {
                    setRootCreateName(e.target.value);
                    setRootCreateError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRootCreate(rootCreateName);
                    else if (e.key === 'Escape') {
                      setCreatingNode(null);
                      setRootCreateName('');
                      setRootCreateError('');
                    }
                  }}
                  onBlur={() => {
                    if (rootCreateName.trim()) submitRootCreate(rootCreateName);
                    else {
                      setCreatingNode(null);
                      setRootCreateName('');
                      setRootCreateError('');
                    }
                  }}
                  className={`bg-[#3c3c3c] text-white px-1 outline-none border w-full text-xs ${rootCreateError ? 'border-red-500' : 'border-blue-500'}`}
                  placeholder={`New ${creatingNode.type}...`}
                />
              </div>
              {rootCreateError && <span className="text-red-400 text-[10px] ml-6 mt-0.5">{rootCreateError}</span>}
            </div>
          )}
          {filesTree.children.map((child) => (
            <FileNode 
              key={child.id} 
              node={child} 
              level={0} 
              activeFile={activeFile} 
              onFileClick={handleFileClick} 
              onRename={onRenameNode}
              onDelete={onDeleteNode}
              onCreateNode={onCreateNode}
              creatingNode={creatingNode}
              setCreatingNode={setCreatingNode}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default FileExplorer;
