import React, { useState } from 'react';
import { X, Search, Copy, MoreHorizontal, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const InviteModal = ({ isOpen, onClose, project, user, setProjects }) => {
  if (!isOpen || !project) return null;

  const [activeTab, setActiveTab] = useState('Invite');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [isLoading, setIsLoading] = useState(false);
  
  // Right pane state (mock for UI)
  const [publicLinkEnabled, setPublicLinkEnabled] = useState(false);
  const [passwordProtection, setPasswordProtection] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = project.owner._id === user._id || project.owner === user._id;

  const handleInviteEmail = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await api.post(`/projects/${project._id}/invite-email`, { email, role });
      toast.success(`Invited ${email} as ${role}`);
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://codecloud.dev/join/${project._id}`);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
        
        {/* Tabs / Header */}
        <div className="flex border-b border-[#1E232B] bg-[#11161D] px-4 pt-2">
          {['Invite', 'Link', 'Manage Access'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab ? 'text-blue-400 border-blue-500' : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col md:flex-row min-h-[400px]">
          
          {/* Left Column */}
          <div className="flex-1 p-6 border-r border-[#1E232B] flex flex-col gap-6">
            <form onSubmit={handleInviteEmail} className="space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Add team members by name or email"
                  className="w-full bg-[#0A0D14] border border-[#1E232B] rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                <div className="flex gap-3">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex-1 bg-[#0A0D14] border border-[#1E232B] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
                  >
                    {isLoading ? '...' : 'Send invite'}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto">
              <h4 className="text-sm font-semibold text-white mb-3">Pending Invites</h4>
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-[#1E232B] last:border-0">
                  <span className="text-sm text-gray-300">alex@example.com (Editor) - Sent</span>
                  <button className="text-sm text-blue-400 hover:text-blue-300">Revoke</button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1E232B] last:border-0">
                  <span className="text-sm text-gray-300">sarah@example.com (Viewer) - Sent</span>
                  <button className="text-sm text-blue-400 hover:text-blue-300">Revoke</button>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white mb-3">Members with access</h4>
              <div className="space-y-3">
                {/* Owner */}
                <div className="flex items-center justify-between p-3 bg-[#0A0D14] border border-[#1E232B] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-sm font-bold text-orange-900">
                      {project.owner?.username?.charAt(0).toUpperCase() || 'O'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white flex items-center gap-1.5">
                        {project.owner?.username || 'Owner'} <span className="text-yellow-500">👑</span>
                      </p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-300 p-1"><MoreHorizontal size={16} /></button>
                </div>

                {/* Example Members from API */}
                {project.collaborators?.map((collab, index) => {
                  if (collab.user?._id === project.owner?._id) return null;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0A0D14] border border-[#1E232B] rounded-xl group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-800">
                          {collab.user?.username?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{collab.user?.username || 'Collaborator'}</p>
                          <p className="text-xs text-gray-500 capitalize">{collab.role}</p>
                        </div>
                      </div>
                      <button className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[320px] p-6 bg-[#161B22] flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200 font-medium">Enable public link</span>
              <button 
                onClick={() => setPublicLinkEnabled(!publicLinkEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${publicLinkEnabled ? 'bg-blue-600' : 'bg-[#30363D]'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${publicLinkEnabled ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Expiration date</label>
              <select className="w-full bg-[#0A0D14] border border-[#1E232B] rounded-lg px-4 py-2 text-gray-400 text-sm focus:outline-none appearance-none cursor-not-allowed" disabled>
                <option>Expiration date</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200 font-medium">Password protection</span>
              <button 
                onClick={() => setPasswordProtection(!passwordProtection)}
                className={`w-10 h-5 rounded-full relative transition-colors ${passwordProtection ? 'bg-blue-600' : 'bg-[#30363D]'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${passwordProtection ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="mt-auto">
              <div className="relative">
                <input 
                  type="text" 
                  readOnly 
                  value="Copy link"
                  className="w-full bg-[#0A0D14] border border-[#1E232B] rounded-lg pl-4 pr-10 py-2.5 text-gray-400 text-sm focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E232B] bg-[#11161D] flex justify-end">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
