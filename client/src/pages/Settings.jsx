import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { MessageSquare, ListTodo, Triangle, Zap, Github, Shield, CreditCard, Building2, AlertTriangle, Key, MonitorSmartphone, Smartphone, Trash2, LogOut, UserMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const IntegrationCard = ({ title, description, icon, connected, hasConnectBtn, onToggle }) => {
  return (
    <div className={`bg-[#11161D] border rounded-xl p-6 shadow-sm flex flex-col justify-between h-[220px] transition-colors ${connected ? 'border-[#30363D]' : 'border-[#1E232B] hover:border-[#30363D]'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#1E232B] border border-[#30363D] rounded-lg flex items-center justify-center text-gray-300">
          {icon}
        </div>
        {connected ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/20 border border-green-900/50 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-medium text-green-400">Connected</span>
          </div>
        ) : hasConnectBtn ? (
          <button className="px-3 py-1.5 bg-[#1E232B] hover:bg-[#30363D] border border-[#30363D] text-gray-300 text-xs font-medium rounded-md transition-colors">
            Connect
          </button>
        ) : null}
      </div>

      <div className="flex-1">
        <h3 className="text-white font-bold mb-1.5">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-[11px] font-mono text-gray-500">{connected ? 'nexus-prod' : 'Not configured'}</span>
        <button 
          onClick={onToggle}
          className={`w-9 h-5 rounded-full relative transition-colors ${connected ? 'bg-blue-600' : 'bg-[#30363D]'}`}
        >
          <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${connected ? 'left-[18px]' : 'left-1'}`}></div>
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user } = useAuth();
  
  // Use localStorage for mock toggles since there is no backend for these
  const [vercelConnected, setVercelConnected] = useState(() => localStorage.getItem('vercel_connected') === 'true');
  const [slackConnected, setSlackConnected] = useState(() => localStorage.getItem('slack_connected') === 'true');
  const [linearConnected, setLinearConnected] = useState(() => localStorage.getItem('linear_connected') === 'true');
  
  // For AI configuration
  const [activeModel, setActiveModel] = useState(() => localStorage.getItem('ai_model') || 'nexus-1');
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('ai_prompt') || '');

  const [githubLinked, setGithubLinked] = useState(false);

  // Workspace State
  const [workspaceName, setWorkspaceName] = useState(user?.workspaceName || `${user?.username || 'User'}'s Workspace`);
  const [workspaceDescription, setWorkspaceDescription] = useState(user?.workspaceDescription || `Personal workspace for ${user?.username || 'User'}.`);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);

  // Password State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    // Check if user has linked github (real backend check)
    api.get('/auth/me')
      .then(res => {
        setGithubLinked(!!res.data.githubId);
        if (res.data.workspaceName) setWorkspaceName(res.data.workspaceName);
        if (res.data.workspaceDescription) setWorkspaceDescription(res.data.workspaceDescription);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSaveWorkspace = async () => {
    setIsSavingWorkspace(true);
    try {
      const { data } = await api.put('/auth/workspace', {
        workspaceName,
        workspaceDescription
      });
      setWorkspaceName(data.workspaceName);
      setWorkspaceDescription(data.workspaceDescription);
      toast.success('Workspace settings updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update workspace');
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      return toast.error('Please enter both passwords');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    
    setIsSavingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleToggleVercel = () => {
    const newVal = !vercelConnected;
    setVercelConnected(newVal);
    localStorage.setItem('vercel_connected', newVal);
    toast.success(newVal ? 'Vercel connected' : 'Vercel disconnected');
  };

  const handleToggleSlack = () => {
    const newVal = !slackConnected;
    setSlackConnected(newVal);
    localStorage.setItem('slack_connected', newVal);
    toast.success(newVal ? 'Slack connected' : 'Slack disconnected');
  };

  const handleToggleLinear = () => {
    const newVal = !linearConnected;
    setLinearConnected(newVal);
    localStorage.setItem('linear_connected', newVal);
    toast.success(newVal ? 'Linear connected' : 'Linear disconnected');
  };

  const handleModelChange = (modelId) => {
    setActiveModel(modelId);
    localStorage.setItem('ai_model', modelId);
    toast.success('AI model updated');
  };

  const handlePromptChange = (e) => {
    setSystemPrompt(e.target.value);
    localStorage.setItem('ai_prompt', e.target.value);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your workspace preferences, integrations, and security.</p>
        </div>

        <div className="space-y-16">
          
          {/* Workspace Settings */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1E232B] flex items-center justify-center text-gray-400">
                <Building2 size={18} />
              </div>
              <h2 className="text-xl font-bold text-white">Workspace Settings</h2>
            </div>
            
            <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Workspace Name</label>
                    <input 
                      type="text" 
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-[#1E232B] rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Workspace Description</label>
                    <textarea 
                      value={workspaceDescription}
                      onChange={(e) => setWorkspaceDescription(e.target.value)}
                      className="w-full h-24 bg-[#0A0D14] border border-[#1E232B] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300">Public Visibility</h4>
                      <p className="text-xs text-gray-500 mt-1">Allow anyone with the link to view this workspace.</p>
                    </div>
                    <button disabled className="w-10 h-6 rounded-full bg-[#30363D] relative transition-colors cursor-not-allowed">
                      <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-1 left-1"></div>
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="opacity-70">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Workspace Logo</label>
                    <div className="border-2 border-dashed border-[#1E232B] rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#0A0D14] transition-colors cursor-not-allowed">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl font-bold mb-4">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <p className="text-sm text-gray-300 font-medium mb-1">Custom logos unavailable</p>
                      <p className="text-xs text-gray-500">Feature requires premium plan</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveWorkspace}
                    disabled={isSavingWorkspace}
                    className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isSavingWorkspace ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1E232B] flex items-center justify-center text-gray-400">
                <Shield size={18} />
              </div>
              <h2 className="text-xl font-bold text-white">Security</h2>
            </div>
            
            <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#1E232B] flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <Key size={16} className="text-gray-400" /> Change Password
                    </h3>
                    <p className="text-xs text-gray-400">Update your account password. We recommend a strong, unique password.</p>
                  </div>
                  {!isEditingPassword && (
                    <button 
                      onClick={() => setIsEditingPassword(true)}
                      className="px-4 py-2 bg-[#1E232B] hover:bg-[#30363D] border border-[#30363D] text-gray-200 text-sm font-medium rounded-lg transition-colors shrink-0"
                    >
                      Update Password
                    </button>
                  )}
                </div>
                
                {isEditingPassword && (
                  <div className="mt-2 p-4 bg-[#0A0D14] border border-[#1E232B] rounded-xl flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#11161D] border border-[#1E232B] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#11161D] border border-[#1E232B] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => { setIsEditingPassword(false); setCurrentPassword(''); setNewPassword(''); }}
                        className="px-4 py-2 bg-transparent text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdatePassword}
                        disabled={isSavingPassword}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {isSavingPassword ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-b border-[#1E232B] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="opacity-70">
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <MonitorSmartphone size={16} className="text-gray-400" /> Session Management
                  </h3>
                  <p className="text-xs text-gray-400">You are currently logged in on 1 device. Review your active sessions.</p>
                </div>
                <button disabled className="px-4 py-2 bg-[#1E232B] border border-[#30363D] text-gray-500 text-sm font-medium rounded-lg transition-colors shrink-0 cursor-not-allowed">
                  View Sessions
                </button>
              </div>

              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-900/10">
                <div className="opacity-70">
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Smartphone size={16} className="text-blue-400" /> Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-blue-200/70">Add an extra layer of security to your account. Highly recommended.</p>
                </div>
                <button disabled className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0 opacity-50 cursor-not-allowed">
                  Enable 2FA
                </button>
              </div>
            </div>
          </section>

          {/* Billing & Usage */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1E232B] flex items-center justify-center text-gray-400">
                <CreditCard size={18} />
              </div>
              <h2 className="text-xl font-bold text-white">Billing & Usage</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Current Plan</h3>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full uppercase">Premium</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-6">$49<span className="text-sm text-gray-500 font-normal"> / month</span></div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Team Members (4/10)</span>
                        <span className="text-gray-500">40%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1E232B] rounded-full overflow-hidden">
                        <div className="w-[40%] h-full bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Storage (45GB/100GB)</span>
                        <span className="text-gray-500">45%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1E232B] rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 shadow-sm flex flex-col items-start justify-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Upgrade to Enterprise</h3>
                <p className="text-sm text-blue-200/70 mb-6 leading-relaxed">Get unlimited members, advanced security controls, and priority support.</p>
                <button className="w-full px-4 py-2 bg-white text-blue-900 hover:bg-gray-100 text-sm font-bold rounded-lg transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </section>

          {/* Connected Services */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1E232B] flex items-center justify-center text-gray-400">
                <ListTodo size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Connected Services</h2>
                <p className="text-xs text-gray-400">Manage your external workspace integrations and API connections.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IntegrationCard 
                title="GitHub"
                description="Sync repositories, manage pull requests, and trigger CI/CD pipelines directly from Nexus."
                icon={<Github size={20} />}
                connected={githubLinked}
                onToggle={() => toast.error('Manage GitHub link in profile settings')}
              />
              
              <IntegrationCard 
                title="Vercel"
                description="Deploy previews, manage environment variables, and view build logs."
                icon={<Triangle size={20} className="fill-current" />}
                connected={vercelConnected}
                onToggle={handleToggleVercel}
              />

              <IntegrationCard 
                title="Slack"
                description="Route build notifications, error alerts, and AI insights to specific channels."
                icon={<MessageSquare size={20} />}
                connected={slackConnected}
                hasConnectBtn={!slackConnected}
                onToggle={handleToggleSlack}
              />

              <IntegrationCard 
                title="Linear"
                description="Link commits to issues, auto-close tickets, and sync project states."
                icon={<ListTodo size={20} />}
                connected={linearConnected}
                hasConnectBtn={!linearConnected}
                onToggle={handleToggleLinear}
              />
            </div>
          </section>

          {/* AI Configuration */}
          <section>
            <div className="bg-[#11161D] border border-[#1E232B] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1E232B]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1E232B] border border-[#30363D] rounded-full flex items-center justify-center text-blue-400">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Nexus AI Configuration</h2>
                    <p className="text-xs text-gray-400">Configure your embedded AI assistant and models.</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-transparent border border-gray-600 rounded-full text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                  Pro Tier Active
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Active Model</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'gpt-4', name: 'GPT-4 Turbo', disabled: true },
                      { id: 'claude-3', name: 'Claude 3 Opus', disabled: true },
                      { id: 'nexus-1', name: 'Nexus-1 (Optimized)', icon: <Zap size={14} className="text-purple-400" /> }
                    ].map(model => (
                      <div 
                        key={model.id}
                        onClick={() => !model.disabled && handleModelChange(model.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                          activeModel === model.id 
                            ? 'bg-[#1E232B] border-blue-500/50' 
                            : 'bg-[#0A0D14] border-[#1E232B] ' + (model.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#30363D] cursor-pointer')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex items-center justify-center">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeModel === model.id ? 'border-blue-500' : 'border-gray-500'}`}>
                              {activeModel === model.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-300">{model.name}</span>
                        </div>
                        {model.icon && activeModel === model.id && <span>{model.icon}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">System Prompt Override</h3>
                  <textarea
                    value={systemPrompt}
                    onChange={handlePromptChange}
                    placeholder="You are Nexus, an expert senior developer assisting..."
                    className="w-full h-[200px] bg-[#0A0D14] border border-[#1E232B] rounded-xl p-4 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-red-900/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle size={18} />
              </div>
              <h2 className="text-xl font-bold text-white">Danger Zone</h2>
            </div>
            
            <div className="border border-red-500/30 bg-red-900/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-50">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <UserMinus size={16} className="text-gray-400" /> Transfer Ownership
                  </h3>
                  <p className="text-xs text-gray-400">Transfer this workspace to another user or organization.</p>
                </div>
                <button disabled className="px-4 py-2 bg-[#1E232B] border border-[#30363D] text-gray-500 text-sm font-medium rounded-lg transition-colors shrink-0 cursor-not-allowed">
                  Transfer
                </button>
              </div>

              <div className="p-6 border-b border-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-50">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <LogOut size={16} className="text-gray-400" /> Leave Workspace
                  </h3>
                  <p className="text-xs text-gray-400">Revoke your own access to this workspace. You will need to be re-invited.</p>
                </div>
                <button disabled className="px-4 py-2 bg-[#1E232B] border border-red-500/30 text-red-800 text-sm font-medium rounded-lg transition-colors shrink-0 cursor-not-allowed">
                  Leave
                </button>
              </div>

              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-50">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Trash2 size={16} className="text-red-400" /> Delete Workspace
                  </h3>
                  <p className="text-xs text-red-300/70">Permanently delete this workspace and all of its contents. This cannot be undone.</p>
                </div>
                <button disabled className="px-4 py-2 bg-red-900/50 text-red-400 text-sm font-medium rounded-lg transition-colors shrink-0 cursor-not-allowed">
                  Delete Workspace
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
