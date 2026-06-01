import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import { GitPullRequest, Rocket, MessageSquare, Headphones, Github, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TeamWorkspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [githubLinked, setGithubLinked] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    api.get('/auth/me')
      .then(res => setGithubLinked(!!res.data.githubId))
      .catch(err => console.error(err));
  }, []);

  // Derive unique team members from all projects
  const teamMembers = React.useMemo(() => {
    const members = new Map();
    // Add current user
    if (user) {
      members.set(user._id || user.email, { ...user, status: 'Active', activity: 'In a huddle' });
    }
    
    projects.forEach(p => {
      if (p.owner && p.owner._id !== user?._id) {
        if (!members.has(p.owner._id)) members.set(p.owner._id, { ...p.owner, status: 'Active', activity: 'Reviewing code' });
      }
      p.collaborators?.forEach(c => {
        if (c.user && c.user._id !== user?._id) {
          if (!members.has(c.user._id)) members.set(c.user._id, { ...c.user, status: 'Offline', activity: 'Offline' });
        }
      });
    });
    
    // Add some default statuses to match mockup structure without totally hardcoding fake users
    const arr = Array.from(members.values());
    if (arr.length > 0) arr[0].activity = 'Online';
    if (arr.length > 1) arr[1].activity = 'Active recently';
    
    return arr;
  }, [projects, user]);

  // Derive activity stream from recent projects
  const activityStream = React.useMemo(() => {
    return projects.slice(0, 3).map((p, i) => {
      const timeAgo = p.updatedAt ? formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true }) : 'recently';
      return {
        id: p._id,
        user: p.owner?.username || 'System',
        action: `updated project`,
        target: p.name,
        time: timeAgo,
        icon: <Rocket size={14} className="text-blue-400" />,
        bg: 'bg-blue-900/30'
      };
    });
  }, [projects]);

  // Sort projects by updatedAt to show most recent as active sessions
  const activeProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 2);
  }, [projects]);

  const handleJoinSession = () => {
    if (activeProjects.length > 0) {
      navigate(`/editor/${activeProjects[0]._id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-gray-400">Workspace</span>
          <span className="text-gray-600">/</span>
          <span className="text-gray-200 border-b-2 border-blue-500 pb-1">Team & Insights</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active Sessions */}
          <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" /> Active Sessions
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 h-32 flex flex-col items-center justify-center text-gray-500">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  Loading sessions...
                </div>
              ) : activeProjects.length > 0 ? (
                activeProjects.map(project => (
                  <div key={project._id} className="relative group cursor-pointer" onClick={() => navigate(`/editor/${project._id}`)}>
                    <ProjectCard 
                      project={project}
                      user={user}
                      myRole="Member"
                      uniqueUsers={[project.owner, ...(project.collaborators?.map(c => c.user) || [])].filter(Boolean)}
                      onInvite={() => {}}
                    />
                    <div className="absolute bottom-5 right-5 flex items-center gap-1.5 bg-[#11161D] px-2 py-1 rounded-full border border-[#1E232B] z-20">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-[10px] font-medium text-blue-400">Live</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 h-32 flex items-center justify-center text-gray-500 border border-dashed border-[#30363D] rounded-xl">No active sessions</div>
              )}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold flex items-center gap-2">
                <RefreshCwIcon className="text-gray-400" /> Activity Stream
              </h2>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="text-center text-gray-500 py-8">Loading activity...</div>
              ) : activityStream.length > 0 ? (
                activityStream.map((activity, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-300">
                          <span className="font-semibold text-white">{activity.user}</span> {activity.action} <span className="text-blue-400 font-medium">{activity.target}</span>
                        </p>
                        <span className="text-xs text-gray-500 shrink-0">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">No recent activity</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6">
          
          {/* Team Pulse */}
          <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold flex items-center gap-2">
                <UsersIcon className="text-gray-400" /> Team Pulse
              </h2>
              <span className="bg-[#1E232B] text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                {teamMembers.filter(m => m.status === 'Active').length} Online
              </span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-500 py-4">Loading team...</div>
              ) : teamMembers.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white border border-[#1E232B]">
                        {member.username?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {member.status === 'Active' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#11161D] rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${member.status === 'Active' ? 'text-white' : 'text-gray-500'}`}>
                        {member.username || member.email || 'Unknown'}
                      </p>
                      <p className="text-[11px] text-gray-500">{member.activity}</p>
                    </div>
                  </div>
                  {idx === 0 && activeProjects.length > 0 && (
                    <button 
                      onClick={handleJoinSession}
                      className="flex items-center gap-1.5 px-2 py-1 bg-[#1E232B] hover:bg-[#30363D] transition-colors rounded text-[10px] font-medium text-gray-300"
                    >
                      <Headphones size={12} /> Join
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Copilot Usage */}
          <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm opacity-60">
            <h2 className="text-white font-bold flex items-center gap-2 mb-6">
              <BotIcon className="text-purple-400" /> AI Copilot Usage
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0A0D14] border border-[#1E232B] rounded-xl p-3">
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">Tokens (7d)</p>
                <p className="text-xl font-semibold text-white mb-1">0</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">-</p>
              </div>
              <div className="bg-[#0A0D14] border border-[#1E232B] rounded-xl p-3">
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">Time Saved</p>
                <p className="text-xl font-semibold text-white mb-1">0h</p>
                <p className="text-[10px] text-gray-500">Est. this week</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">AI metrics are currently unavailable.</p>
          </div>

          {/* GitHub Sync */}
          <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {githubLinked && (
              <div className="absolute top-0 right-0 p-6">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            )}
            <h2 className="text-white font-bold flex items-center gap-2 mb-4">
              <Github className="text-gray-300" size={18} /> GitHub Sync
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Account Linked:</span>
                <span className="text-gray-300 font-mono">{githubLinked ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={githubLinked ? "text-green-400" : "text-gray-500"}>
                  {githubLinked ? 'Healthy' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

// Simple Icon wrappers
const RefreshCwIcon = ({ className }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const UsersIcon = ({ className }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BotIcon = ({ className }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;

export default TeamWorkspace;
