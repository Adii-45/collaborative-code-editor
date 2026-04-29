import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Code2, Plus, Trash2, FolderOpen, LogOut, Clock, Edit2, UserPlus } from 'lucide-react';
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
      // Reload projects to get fully populated owner/collaborators
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

  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

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
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Project
          </button>
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
                        <Code2 size={18} className="text-blue-400" />
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
