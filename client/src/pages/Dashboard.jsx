import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import CreateProjectDialog from '../components/CreateProjectDialog';
import InviteModal from '../components/InviteModal';
import { Plus, Github } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const openInviteModal = (project) => {
    setSelectedProject(project);
    setInviteModalOpen(true);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout onSearch={setSearchQuery}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Good morning, {user?.username || 'Dev'}
        </h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <Plus size={18} />
            New Project
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Github size={18} />
            Import Repo
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-32 bg-[#11161D] rounded-2xl border border-[#1E232B]">
          <h3 className="text-gray-200 text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first project to start coding</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-32 bg-[#11161D] rounded-2xl border border-[#1E232B]">
          <h3 className="text-gray-200 text-lg font-semibold mb-2">No results found</h3>
          <p className="text-gray-500 text-sm">No projects match your search query "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map(project => {
            const isOwner = project.owner._id === user._id || project.owner === user._id;
            
            let myRole = 'Owner';
            if (!isOwner) {
              const collab = project.collaborators?.find(c => c.user._id === user._id || c.user === user._id);
              myRole = collab ? collab.role : 'Member';
            }

            const usersList = [project.owner, ...(project.collaborators?.map(c => c.user) || [])].filter(Boolean);
            const uniqueUsers = Array.from(new Map(usersList.map(u => [u._id, u])).values());

            return (
              <ProjectCard 
                key={project._id}
                project={project}
                user={user}
                myRole={myRole}
                uniqueUsers={uniqueUsers}
                onInvite={openInviteModal}
              />
            );
          })}
        </div>
      )}

      <CreateProjectDialog 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onProjectCreated={fetchProjects}
      />
      
      <InviteModal 
        isOpen={inviteModalOpen} 
        onClose={() => { setInviteModalOpen(false); fetchProjects(); }} 
        project={selectedProject}
        user={user}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
