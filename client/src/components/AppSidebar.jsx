import React from 'react';
import { Folder, Users, Activity, Settings, Code2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: Folder, label: 'Projects', path: '/dashboard' },
  { icon: Users, label: 'Teams', path: '/teams' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-[88px] h-screen bg-[#0A0D14] border-r border-[#1E232B] flex flex-col items-center py-6 shrink-0 z-10">
      <div className="w-10 h-10 bg-[#3b82f6] rounded-xl flex items-center justify-center mb-8 shrink-0">
        <Code2 size={24} className="text-white" />
      </div>

      <nav className="flex flex-col gap-6 flex-1 w-full items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1.5 w-full py-2 px-2 transition-colors relative group ${
                isActive ? 'text-[#3b82f6]' : 'text-[#8B949E] hover:text-gray-200'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#3b82f6] rounded-r-full"></div>
              )}
              <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/10' : 'group-hover:bg-[#1E232B]'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppSidebar;
