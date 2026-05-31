import React, { useState } from 'react';
import { X, Search, Github, FileCode2, Layout, Database } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateProjectDialog = ({ isOpen, onClose, onProjectCreated }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreateBlank = async () => {
    const name = prompt('Enter project name:', 'Untitled Project');
    if (!name) return;
    
    setIsCreating(true);
    try {
      const { data } = await api.post('/projects', { name: name.trim() });
      onProjectCreated();
      onClose();
      navigate(`/editor/${data._id}`);
      toast.success('Project created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportGithub = () => {
    const url = prompt('Enter GitHub repository URL (e.g., https://github.com/user/repo):');
    if (!url) return;
    
    setIsCreating(true);
    api.post('/github/import-url', { repoUrl: url.trim() })
      .then(({ data }) => {
        toast.success(`Project "${data.projectName}" created!`);
        onProjectCreated();
        onClose();
        navigate(`/editor/${data.projectId}`);
      })
      .catch(error => {
        toast.error(error.response?.data?.message || 'Failed to import repository');
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  // Mock template action linking to blank creation to preserve backend rules
  const handleUseTemplate = (templateName) => {
    const name = prompt(`Enter project name for ${templateName}:`, `${templateName} App`);
    if (!name) return;
    
    setIsCreating(true);
    api.post('/projects', { name: name.trim() })
      .then(({ data }) => {
        toast.success(`${templateName} project created!`);
        onProjectCreated();
        onClose();
        navigate(`/editor/${data._id}`);
      })
      .catch(error => {
        toast.error(error.response?.data?.message || 'Failed to create project');
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  const tabs = ['All', 'Frontend', 'Backend', 'Fullstack'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-[#161b22]/90 border border-[#30363d] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create New Project</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="px-6 py-4 border-b border-[#30363d] space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Blank Project */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-center group h-[220px]">
              <div className="w-12 h-12 bg-[#21262d] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#30363d] transition-colors">
                <FileCode2 size={24} className="text-gray-300" />
              </div>
              <h3 className="text-white font-semibold mb-1">Blank Project</h3>
              <p className="text-xs text-gray-400 mb-6">Start from scratch</p>
              <button 
                onClick={handleCreateBlank}
                disabled={isCreating}
                className="w-full bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-medium py-2 rounded-lg transition-colors border border-[#30363d]"
              >
                Create Blank
              </button>
            </div>

            {/* Import GitHub */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-center group h-[220px]">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                <Github size={28} className="text-black" />
              </div>
              <h3 className="text-white font-semibold mb-1">Import from GitHub</h3>
              <p className="text-xs text-gray-400 mb-6">Connect your repository</p>
              <button 
                onClick={handleImportGithub}
                disabled={isCreating}
                className="w-full bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-medium py-2 rounded-lg transition-colors border border-[#30363d]"
              >
                Connect GitHub
              </button>
            </div>

            {/* Next.js Template (Highlighted) */}
            <div className="bg-[#1c2333] border border-blue-500 rounded-xl overflow-hidden flex flex-col group relative h-[220px]">
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>
              <div className="h-[100px] bg-black flex items-center justify-center border-b border-[#30363d]">
                 <span className="text-white text-2xl font-bold tracking-tighter">NEXT.js</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-semibold text-sm mb-1">Next.js</h3>
                <p className="text-[11px] text-gray-400 mb-4 line-clamp-2">Start a Next.js project with App router.</p>
                <button 
                  onClick={() => handleUseTemplate('Next.js')}
                  disabled={isCreating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors mt-auto flex items-center justify-center gap-1.5"
                >
                  <Code2 size={14} /> Use Template
                </button>
              </div>
            </div>

            {/* React Template */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden flex flex-col hover:border-blue-500 transition-colors h-[220px]">
              <div className="h-[100px] bg-[#282c34] flex items-center justify-center border-b border-[#30363d]">
                 <div className="text-[#61dafb]">
                   <svg viewBox="0 0 118 33.7" className="w-16 h-16 fill-current"><path d="M11.6,18.8c0-3.3,3.7-6.2,9.6-8.2c4.4-1.5,9.6-2.4,15-2.6c5.4,0.2,10.6,1.1,15,2.6c6,2,9.6,4.9,9.6,8.2 c0,3.3-3.7,6.2-9.6,8.2c-4.4,1.5-9.6,2.4-15,2.6c-5.4-0.2-10.6-1.1-15-2.6C15.3,25,11.6,22,11.6,18.8z M36.2,28.6 c-6.4,0-12.7-1.1-18.4-3.3c-6.8-2.6-11.2-6.5-11.2-10.8c0-4.3,4.5-8.2,11.2-10.8c5.7-2.1,12-3.3,18.4-3.3c6.4,0,12.7,1.1,18.4,3.3 c6.8,2.6,11.2,6.5,11.2,10.8c0,4.3-4.5,8.2-11.2,10.8C59,27.5,52.7,28.6,36.2,28.6z"></path><path d="M19,10c-3-2.1-5.7-4.6-8-7.3c1.7-2,3.8-3.6,6-4.9c4,2.5,7.7,5.5,10.9,8.9C24.4,7.8,21.6,8.8,19,10z"></path><path d="M66,9.2c-3.1-3.4-6.8-6.4-10.9-8.9c2.3,1.3,4.4,2.9,6,4.9c-2.3,2.7-5,5.2-8,7.3C55.6,11,58.4,10,66,9.2z"></path><path d="M12.9,23.5c2.3,2.7,5,5.2,8,7.3c2.6-1.1,5.3-2.2,8.9-2.5c-3.1-3.4-6.8-6.4-10.9-8.9 C17.3,20.6,15,21.9,12.9,23.5z"></path><path d="M61,23.5c-2.1-1.6-4.4-2.9-6-4.9c-4,2.5-7.7,5.5-10.9,8.9c3.6,0.3,6.3,1.4,8.9,2.5C56,28.7,58.7,26.2,61,23.5z"></path></svg>
                 </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-semibold text-sm mb-1">React</h3>
                <p className="text-[11px] text-gray-400 mb-4 line-clamp-2">Sample components a React component.</p>
              </div>
            </div>

            {/* Node.js Template */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden flex flex-col hover:border-blue-500 transition-colors h-[220px]">
              <div className="h-[100px] bg-[#333333] flex items-center justify-center border-b border-[#30363d]">
                 <span className="text-[#8CC84B] font-bold text-2xl">node<span className="text-white">.js</span></span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-semibold text-sm mb-1">Node.js</h3>
                <p className="text-[11px] text-gray-400 mb-4 line-clamp-2">Server and Node.js with server.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectDialog;
