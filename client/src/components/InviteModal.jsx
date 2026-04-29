import React, { useState } from 'react';
import { X, Mail, Link as LinkIcon, Users, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const InviteModal = ({ isOpen, onClose, project, user, setProjects }) => {
  if (!isOpen || !project) return null;

  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
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
      
      // Ideally refresh project list here to show new collaborator, but we'll let the user refresh or we can fetch again
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/projects/${project._id}/invite-link`, { role });
      const url = `${window.location.origin}/invite/${data.token}`;
      setInviteLink(url);
      toast.success('Invite link generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <h3 className="text-lg font-semibold text-white">Share "{project.name}"</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#30363d] bg-[#0d1117]">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'email' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#161b22]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Mail size={16} /> Email
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'link' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#161b22]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <LinkIcon size={16} /> Link
          </button>
          <button
            onClick={() => setActiveTab('collabs')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'collabs' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#161b22]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users size={16} /> People
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 min-h-[200px]">
          {activeTab === 'email' && (
            <form onSubmit={handleInviteEmail} className="space-y-4">
              <p className="text-sm text-gray-400">Invite someone by their email address.</p>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="editor">Editor (Can edit files)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send Invite'}
              </button>
            </form>
          )}

          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Anyone with this link can join the project.</p>
              
              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none mb-4"
                >
                  <option value="editor">Editor Access</option>
                  <option value="viewer">Viewer Access</option>
                </select>
              </div>

              {!inviteLink ? (
                <button
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                  className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  {isLoading ? 'Generating...' : 'Generate Invite Link'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2.5 text-gray-300 text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collabs' && (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                    {project.owner?.username?.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{project.owner?.username || 'Owner'}</p>
                    <p className="text-xs text-gray-500">{project.owner?.email || 'Owner'}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">Owner</span>
              </div>

              {project.collaborators?.map((collab, index) => {
                if (collab.user?._id === project.owner?._id) return null; // Skip owner as they are listed above
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center text-sm font-bold text-gray-300">
                        {collab.user?.username?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{collab.user?.username || 'Collaborator'}</p>
                        <p className="text-xs text-gray-500">{collab.user?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 capitalize">{collab.role}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
