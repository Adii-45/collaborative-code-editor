import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Code2, Plus, Trash2, FolderOpen, LogOut, Clock, Edit2, UserPlus, Github, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import InviteModal from '../components/InviteModal';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [renameProjectId, setRenameProjectId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // GitHub Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRepoUrl, setImportRepoUrl] = useState('');
  const [importProjectId, setImportProjectId] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      const { data } = await api.post('/projects', { name: newProjectName.trim() });
      fetchProjects();
      setNewProjectName('');
      setIsCreating(false);
      toast.success('Project created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleRenameSubmit = async (id) => {
    if (!renameValue.trim()) return;
    try {
      const { data } = await api.put(`/projects/${id}`, { name: renameValue.trim() });
      setProjects(prev => prev.map(p => p._id === id ? { ...p, name: data.project.name } : p));
      setRenameProjectId(null);
      toast.success('Project renamed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to rename project');
    }
  };

  const handleConnectGitHub = () => {
    // Redirect to GitHub OAuth
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'dummy_client_id'; // Fallback for dev if not set
    const redirectUri = `${window.location.origin}/github/callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user&redirect_uri=${redirectUri}`;
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importRepoUrl || !importProjectId) {
      toast.error('Repo URL and Project selection required');
      return;
    }

    setIsImporting(true);
    try {
      await api.post('/github/import', {
        projectId: importProjectId,
        repoUrl: importRepoUrl
      });
      toast.success('Repository imported successfully!');
      setIsImportModalOpen(false);
      setImportRepoUrl('');
      setImportProjectId('');
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import repository');
    } finally {
      setIsImporting(false);
    }
  };

  const openInviteModal = (project) => {
    setSelectedProject(project);
    setInviteModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const myOwnedProjects = projects.filter(p => p.owner._id === user._id || p.owner === user._id);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-[#30363d] bg-[#161b22]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="font-semibold text-lg">Code Editor</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleConnectGitHub}
              className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Github size={16} />
              {user?.githubUsername ? `Connected: ${user.githubUsername}` : 'Connect GitHub'}
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Import Repo
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        </div>

        {/* Create Project Inline */}
        {isCreating && (
          <form onSubmit={handleCreateProject} className="mb-6 bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex items-center gap-3">
            <input
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Project name..."
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setNewProjectName(''); }}
              className="text-gray-400 hover:text-white px-3 py-2 text-sm transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Import Repo Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Github size={20} /> Import Repository
              </h3>
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Repository URL</label>
                  <input
                    type="url"
                    required
                    value={importRepoUrl}
                    onChange={(e) => setImportRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Project</label>
                  <select
                    required
                    value={importProjectId}
                    onChange={(e) => setImportProjectId(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a project to import into...</option>
                    {myOwnedProjects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-yellow-500 mt-1">Warning: Importing will overwrite the selected project's files.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="flex-1 py-2 rounded-lg font-medium text-sm text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !importRepoUrl || !importProjectId}
                    className="flex-1 py-2 rounded-lg font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isImporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Import'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No projects yet</p>
            <p className="text-gray-500 text-sm">Create your first project to start coding</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => {
              const isOwner = project.owner._id === user._id || project.owner === user._id;
              
              // Find user's role
              let myRole = 'Owner';
              if (!isOwner) {
                const collab = project.collaborators?.find(c => c.user._id === user._id || c.user === user._id);
                myRole = collab ? collab.role : 'Member';
              }

              // Gather all unique users for avatars
              const usersList = [project.owner, ...(project.collaborators?.map(c => c.user) || [])].filter(Boolean);
              // Deduplicate users by ID
              const uniqueUsers = Array.from(new Map(usersList.map(u => [u._id, u])).values());

              return (
                <div
                  key={project._id}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#484f58] transition-colors group flex items-center justify-between"
                >
                  <div
                    className="flex flex-col flex-1 cursor-pointer pr-4"
                    onClick={() => navigate(`/editor/${project._id}`)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-[#21262d] p-2 rounded-lg">
                        {project.isGithubLinked ? (
                          <Github size={18} className="text-green-400" />
                        ) : (
                          <Code2 size={18} className="text-blue-400" />
                        )}
                      </div>
                      
                      {renameProjectId === project._id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(project._id)}
                            className="bg-[#0d1117] border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
                          />
                          <button onClick={() => handleRenameSubmit(project._id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                          <button onClick={() => setRenameProjectId(null)} className="text-xs text-gray-400">Cancel</button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h3>
                      )}
                      
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#21262d] text-gray-400 border border-[#30363d]">
                        {myRole}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>Updated {formatDate(project.updatedAt)}</span>
                      </div>
                      
                      {project.isGithubLinked && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Github size={14} />
                          <span>Linked</span>
                        </div>
                      )}
                      
                      {uniqueUsers.length > 0 && (
                        <div className="flex -space-x-2">
                          {uniqueUsers.slice(0, 3).map((u, i) => (
                            <div 
                              key={i} 
                              className="w-6 h-6 rounded-full bg-[#30363d] border-2 border-[#161b22] flex items-center justify-center text-[10px] font-bold text-white z-10"
                              title={u.username || u.email}
                            >
                              {getInitials(u.username || u.email)}
                            </div>
                          ))}
                          {uniqueUsers.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-[#21262d] border-2 border-[#161b22] flex items-center justify-center text-[10px] font-bold text-gray-400 z-0">
                              +{uniqueUsers.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOwner && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenameValue(project.name); setRenameProjectId(project._id); }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#30363d] rounded-md transition-colors"
                        title="Rename Project"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    
                    {(isOwner || myRole === 'editor') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openInviteModal(project); }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-[#30363d] rounded-md transition-colors"
                        title="Invite Collaborators"
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                    
                    {isOwner && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id, project.name); }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#30363d] rounded-md transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <InviteModal 
        isOpen={inviteModalOpen} 
        onClose={() => { setInviteModalOpen(false); fetchProjects(); }} 
        project={selectedProject}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
