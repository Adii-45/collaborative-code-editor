import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import { GitPullRequest, Rocket, MessageSquare, Headphones, Github, Sparkles } from 'lucide-react';

const TeamWorkspace = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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
    if (arr.length > 0) arr[0].activity = 'In a huddle';
    if (arr.length > 1) arr[1].activity = 'Reviewing PRs';
    
    return arr;
  }, [projects, user]);

  // Derive activity stream from recent projects
  const activityStream = React.useMemo(() => {
    return projects.slice(0, 3).map((p, i) => ({
      id: p._id,
      user: p.owner?.username || 'System',
      action: i === 0 ? `opened pull request for` : i === 1 ? `deployed to production` : `reviewed code in`,
      target: p.name,
      time: i === 0 ? '10m ago' : i === 1 ? '1h ago' : '2h ago',
      icon: i === 0 ? <GitPullRequest size={14} className="text-purple-400" /> : i === 1 ? <Rocket size={14} className="text-blue-400" /> : <MessageSquare size={14} className="text-gray-400" />,
      bg: i === 0 ? 'bg-purple-900/30' : i === 1 ? 'bg-blue-900/30' : 'bg-gray-800'
    }));
  }, [projects]);

  const activeProjects = projects.slice(0, 2);

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
              <button className="text-xs text-gray-400 hover:text-white transition-colors">View All →</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 h-32 flex items-center justify-center text-gray-500">Loading sessions...</div>
              ) : activeProjects.length > 0 ? (
                activeProjects.map(project => (
                  <div key={project._id} className="relative group">
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
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-[#1E232B] text-white text-xs font-medium rounded-full">All</button>
                <button className="px-3 py-1 text-gray-400 hover:text-white text-xs font-medium rounded-full transition-colors">Commits</button>
                <button className="px-3 py-1 text-gray-400 hover:text-white text-xs font-medium rounded-full transition-colors">PRs</button>
              </div>
            </div>

            <div className="space-y-6">
              {activityStream.map((activity, idx) => (
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
                    {idx === 0 && (
                      <div className="mt-2 bg-[#0A0D14] border border-[#1E232B] rounded-lg p-3">
                        <p className="text-xs text-gray-300 mb-2">Implement new auth flow with JWT refresh tokens</p>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-mono bg-[#1E232B] px-1.5 py-0.5 rounded text-gray-400">auth-service</span>
                          <span className="text-[10px] font-mono bg-red-900/20 text-red-400 px-1.5 py-0.5 rounded">-12</span>
                          <span className="text-[10px] font-mono bg-green-900/20 text-green-400 px-1.5 py-0.5 rounded">+145</span>
                        </div>
                      </div>
                    )}
                    {idx === 2 && (
                      <div className="mt-2 border-l-2 border-[#30363D] pl-3 py-1">
                        <p className="text-xs text-gray-400 italic">"Looks solid, but we should probably memoize this component to prevent unnecessary re-renders on the dashboard."</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
              {teamMembers.map((member, idx) => (
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
                  {idx === 0 && (
                    <button className="flex items-center gap-1.5 px-2 py-1 bg-[#1E232B] hover:bg-[#30363D] transition-colors rounded text-[10px] font-medium text-gray-300">
                      <Headphones size={12} /> Join
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Copilot Usage */}
          <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm">
            <h2 className="text-white font-bold flex items-center gap-2 mb-6">
              <BotIcon className="text-purple-400" /> AI Copilot Usage
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0A0D14] border border-[#1E232B] rounded-xl p-3">
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">Tokens (7d)</p>
                <p className="text-xl font-semibold text-white mb-1">1.2M</p>
                <p className="text-[10px] text-green-400 flex items-center gap-1">↗ +12%</p>
              </div>
              <div className="bg-[#0A0D14] border border-[#1E232B] rounded-xl p-3">
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">Time Saved</p>
                <p className="text-xl font-semibold text-white mb-1">14h</p>
                <p className="text-[10px] text-gray-500">Est. this week</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-3">Top Actions</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="w-2/3 h-1.5 bg-[#1E232B] rounded-full overflow-hidden">
                    <div className="w-[80%] h-full bg-purple-500"></div>
                  </div>
                  <span className="text-gray-400 font-mono">Code Gen</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="w-2/3 h-1.5 bg-[#1E232B] rounded-full overflow-hidden">
                    <div className="w-[45%] h-full bg-blue-500"></div>
                  </div>
                  <span className="text-gray-400 font-mono">Refactoring</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="w-2/3 h-1.5 bg-[#1E232B] rounded-full overflow-hidden">
                    <div className="w-[15%] h-full bg-teal-500"></div>
                  </div>
                  <span className="text-gray-400 font-mono">Docs</span>
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Sync */}
          <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <h2 className="text-white font-bold flex items-center gap-2 mb-4">
              <Github className="text-gray-300" size={18} /> GitHub Sync
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Organization:</span>
                <span className="text-gray-300 font-mono">nexus-dev</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Sync:</span>
                <span className="text-gray-300">Just now</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="text-teal-400">Healthy</span>
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
