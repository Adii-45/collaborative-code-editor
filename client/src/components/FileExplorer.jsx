import React, { useState, useEffect, useRef } from 'react';
import { FilePlus, FolderPlus, RefreshCw, ChevronRight, ChevronDown, Folder, File as FileIcon, Trash2, Edit2 } from 'lucide-react';
import { SiJavascript, SiHtml5, SiCss, SiPython, SiCplusplus, SiJson, SiTypescript } from 'react-icons/si';
import { DndContext, useDraggable, useDroppable, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

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

  const handleCreateSubmit = (e) => {
    if (e.key === 'Enter') {
      if (createName.trim()) {
        onCreateNode(node.id, createName.trim(), creatingNode.type);
      }
      setCreatingNode(null);
      setCreateName('');
    } else if (e.key === 'Escape') {
      setCreatingNode(null);
      setCreateName('');
    }
  };

  const handleCreateInline = (e, type) => {
    e.stopPropagation();
    setIsOpen(true);
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
            <div style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }} className="flex items-center gap-2 py-1">
              {creatingNode.type === 'folder' ? <Folder size={14} className="text-blue-400" /> : <FileIcon size={14} className="text-gray-400" />}
              <input
                autoFocus
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                onKeyDown={handleCreateSubmit}
                onBlur={() => setCreatingNode(null)}
                className="bg-[#3c3c3c] text-white px-1 outline-none border border-blue-500 w-full text-xs"
                placeholder={`New ${creatingNode.type}...`}
              />
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="h-full w-full bg-[#181818] flex flex-col select-none">
        <div className="px-4 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <button onClick={() => setCreatingNode({ parentId: 'root', type: 'file' })} className="hover:text-white" title="New File">
              <FilePlus size={14} />
            </button>
            <button onClick={() => setCreatingNode({ parentId: 'root', type: 'folder' })} className="hover:text-white" title="New Folder">
              <FolderPlus size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2 overflow-x-hidden">
          {creatingNode?.parentId === 'root' && (
            <div className="flex items-center gap-2 py-1 px-4">
              {creatingNode.type === 'folder' ? <Folder size={14} className="text-blue-400" /> : <FileIcon size={14} className="text-gray-400" />}
              <input
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    onCreateNode('root', e.target.value.trim(), creatingNode.type);
                    setCreatingNode(null);
                  } else if (e.key === 'Escape') {
                    setCreatingNode(null);
                  }
                }}
                onBlur={() => setCreatingNode(null)}
                className="bg-[#3c3c3c] text-white px-1 outline-none border border-blue-500 w-full text-xs"
                placeholder={`New ${creatingNode.type}...`}
              />
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
