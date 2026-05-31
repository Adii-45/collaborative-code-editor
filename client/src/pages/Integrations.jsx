import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Code2, MessageSquare, ListTodo, Triangle, Zap, Github } from 'lucide-react';
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

const Integrations = () => {
  const { user } = useAuth();
  
  // Use localStorage for mock toggles since there is no backend for these
  const [vercelConnected, setVercelConnected] = useState(() => localStorage.getItem('vercel_connected') === 'true');
  const [slackConnected, setSlackConnected] = useState(() => localStorage.getItem('slack_connected') === 'true');
  const [linearConnected, setLinearConnected] = useState(() => localStorage.getItem('linear_connected') === 'true');
  
  // For AI configuration
  const [activeModel, setActiveModel] = useState(() => localStorage.getItem('ai_model') || 'nexus-1');
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('ai_prompt') || '');

  const [githubLinked, setGithubLinked] = useState(false);

  useEffect(() => {
    // Check if user has linked github (real backend check)
    api.get('/auth/me')
      .then(res => setGithubLinked(!!res.data.githubId))
      .catch(err => console.error(err));
  }, []);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <span className="text-gray-400">Integrations</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-200">Workspace Connections</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
          Live Share
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Connected Services</h1>
        <p className="text-sm text-gray-400">Manage your external workspace integrations and API connections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

      {/* AI Configuration Panel */}
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
                { id: 'nexus-1', name: 'Nexus-1 (Optimized)', icon: <Zap size={14} className="text-gray-400" /> }
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

    </DashboardLayout>
  );
};

export default Integrations;
