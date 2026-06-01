import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, onSearch }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-[#0A0D14] text-white overflow-hidden font-sans">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-[72px] border-b border-[#1E232B] flex items-center justify-between px-6 shrink-0 bg-[#0A0D14]">
          {/* Workspace Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E232B] bg-[#11161D] opacity-70 cursor-not-allowed" title="Workspace switching is not available">
            <div className="w-5 h-5 bg-[#3b82f6]/20 rounded text-[#3b82f6] flex items-center justify-center text-xs font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-200">{user?.username || 'User'}'s Workspace</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl px-8">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                onChange={(e) => onSearch && onSearch(e.target.value)}
                className="w-full bg-[#11161D] border border-[#1E232B] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#30363D] focus:bg-[#161B22] transition-colors"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 opacity-50 cursor-not-allowed transition-colors" title="Notifications (Coming Soon)">
                <Bell size={18} />
              </button>
              <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1E232B] transition-colors" title="Settings">
                <Settings size={18} />
              </button>
            </div>
            
            <div className="h-6 w-px bg-[#1E232B]"></div>
            
            {/* User Avatar */}
            <button className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white border border-[#1E232B]">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0A0D14] p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
