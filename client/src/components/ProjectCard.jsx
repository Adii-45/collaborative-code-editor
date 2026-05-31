import React from 'react';
import { Github, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, user, myRole, uniqueUsers, onRename, onDelete, onInvite }) => {
  const navigate = useNavigate();
  const isOwner = myRole === 'Owner' || myRole === 'Admin';
  
  // Hash name to get a consistent color for the icon background
  const colors = ['text-blue-400 bg-blue-500/10', 'text-purple-400 bg-purple-500/10', 'text-green-400 bg-green-500/10', 'text-orange-400 bg-orange-500/10'];
  const colorIndex = project.name.length % colors.length;
  const colorClass = colors[colorIndex];

  // Decorative SVG line for visual aesthetic matching the screenshot
  const decorativeLinePaths = [
    "M0 20 Q 20 5 40 20 T 80 20 T 120 10",
    "M0 10 Q 30 25 60 10 T 120 20",
    "M0 15 Q 25 0 50 15 T 100 15 T 120 5",
    "M0 25 Q 40 5 80 25 T 120 15"
  ];
  const path = decorativeLinePaths[colorIndex];

  return (
    <div 
      onClick={() => navigate(`/editor/${project._id}`)}
      className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-5 hover:border-[#30363D] transition-all cursor-pointer group relative flex flex-col justify-between h-44 shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${colorClass}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-lg group-hover:text-blue-400 transition-colors line-clamp-1">
              {project.name}
            </h3>
            {/* Badges - using a default since we don't have this in DB, but styling to match design */}
            <div className="flex gap-1.5 mt-2">
               <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1E232B] text-gray-400 border border-[#30363D]">
                 Web
               </span>
            </div>
          </div>
        </div>
        
        {/* Decorative Sparkline matching design */}
        <div className="w-24 h-8 opacity-40">
          <svg width="100%" height="100%" viewBox="0 0 120 30" preserveAspectRatio="none">
            <path d={path} fill="none" stroke="currentColor" strokeWidth="2" className={colorClass.split(' ')[0]} />
            <path d={`${path} L 120 30 L 0 30 Z`} fill="currentColor" className={colorClass.split(' ')[0].replace('text', 'fill')} opacity="0.1" />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          {project.isGithubLinked ? (
            <>
              <CheckCircle2 size={12} className="text-gray-400" />
              <span>Synced with GitHub</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
              <span>Local Project</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Action Menu (visible on hover) */}
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 mr-2" onClick={e => e.stopPropagation()}>
             {(isOwner || myRole === 'editor') && (
               <button onClick={() => onInvite(project)} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1E232B] rounded-md transition-colors" title="Invite">
                 <MoreHorizontal size={14} />
               </button>
             )}
          </div>

          {/* Avatars */}
          {uniqueUsers && uniqueUsers.length > 0 && (
            <div className="flex -space-x-1.5">
              {uniqueUsers.slice(0, 3).map((u, i) => {
                const initials = u.username ? u.username.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase();
                const avatarColors = ['bg-orange-200 text-orange-800', 'bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800'];
                const avColor = avatarColors[i % avatarColors.length];
                
                return (
                  <div 
                    key={i} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#11161D] z-10 ${avColor}`}
                    title={u.username || u.email}
                  >
                    {initials}
                  </div>
                );
              })}
              {uniqueUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-[#1E232B] border-2 border-[#11161D] flex items-center justify-center text-[10px] font-bold text-gray-400 z-0">
                  +{uniqueUsers.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
