import React, { useState } from 'react';
import { MoreHorizontal, Bot, Send } from 'lucide-react';
import Preview from './Preview';

const RightSidebar = ({ connectedUsers, filesTree, isRunning, previewUrl }) => {
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'preview'
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="h-full bg-[#11161D] flex flex-col border-l border-[#1E232B]">
      
      {/* Tab Switcher (custom addition to preserve Preview functionality while matching screenshot) */}
      <div className="flex border-b border-[#1E232B]">
         <button 
           onClick={() => setActiveTab('ai')}
           className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'ai' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
         >
           Nexus AI
         </button>
         <button 
           onClick={() => setActiveTab('preview')}
           className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
         >
           Preview
         </button>
      </div>

      {activeTab === 'preview' ? (
        <Preview filesTree={filesTree} isRunning={isRunning} previewUrl={previewUrl} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Member Presence */}
          <div className="p-4 border-b border-[#1E232B] shrink-0">
            <h3 className="text-xs font-semibold text-gray-400 mb-3 tracking-wider">MEMBER PRESENCE</h3>
            <div className="space-y-3">
              {connectedUsers?.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-blue-900/50 flex items-center justify-center text-xs font-medium text-blue-200 border border-blue-500/20">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#11161D] rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-300">{user.username}</span>
                </div>
              ))}
              {/* Fallback mock users if none connected (to match screenshot visual) */}
              {(!connectedUsers || connectedUsers.length === 0) && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-teal-900/50 flex items-center justify-center text-xs font-medium text-teal-200 border border-teal-500/20">S</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#11161D] rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-300">Sarah J.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-orange-900/50 flex items-center justify-center text-xs font-medium text-orange-200 border border-orange-500/20">A</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#11161D] rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-300">Alex M.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-400 border border-gray-700">D</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-500 border-2 border-[#11161D] rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-500">David K.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nexus AI Chat */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0D14]">
            <div className="flex items-center justify-between p-4 border-b border-[#1E232B] bg-[#11161D]">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Nexus AI</h3>
              </div>
              <button className="text-gray-500 hover:text-white transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* User Message */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-900/50 flex items-center justify-center text-[10px] font-medium text-orange-200 shrink-0">A</div>
                <div className="bg-[#1E232B] rounded-lg p-3 text-sm text-gray-200 leading-relaxed">
                  Can you help me optimize the state management in this Header component?
                </div>
              </div>

              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Bot size={14} />
                </div>
                <div className="text-sm text-gray-300 leading-relaxed space-y-3">
                  <p>Looking at lines 5-9, the current toggle state is fine, but if you plan to share this state across other components, you might want to consider a context provider or a lightweight store.</p>
                  <p>Here's a quick refactor using Zustand:</p>
                  
                  <div className="bg-[#11161D] border border-[#1E232B] rounded-lg overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-[#1E232B] text-xs text-gray-500">store.ts</div>
                    <div className="p-3 font-mono text-xs overflow-x-auto text-gray-300">
                      <span className="text-purple-400">import</span> {'{'} create {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'zustand'</span>;<br/><br/>
                      <span className="text-purple-400">export const</span> <span className="text-blue-300">useNavStore</span> = <span className="text-yellow-300">create</span>((<span className="text-orange-300">set</span>) {'=>'} ({'{'}<br/>
                      &nbsp;&nbsp;isOpen: <span className="text-orange-400">false</span>,<br/>
                      &nbsp;&nbsp;<span className="text-blue-300">toggle</span>: () {'=>'} <span className="text-yellow-300">set</span>((<span className="text-orange-300">state</span>) {'=>'} ({'{'} isOpen: !state.isOpen {'}'})),<br/>
                      {'}'}));
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-[#1E232B] hover:bg-[#30363D] text-gray-300 text-xs font-medium rounded-md transition-colors border border-[#30363D]">
                      Copy
                    </button>
                    <button className="flex-1 py-1.5 bg-[#1E232B] hover:bg-[#30363D] text-gray-300 text-xs font-medium rounded-md transition-colors border border-[#30363D] flex items-center justify-center gap-1">
                      <Check size={12} /> Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1E232B] bg-[#11161D]">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Nexus AI about your code..."
                  className="w-full bg-[#0A0D14] border border-[#1E232B] rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <Send size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[10px] text-gray-600">Press ⌘K to focus</span>
                <span className="text-[10px] text-gray-600">Nexus AI v2.1</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
