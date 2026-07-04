import React from 'react';
import { motion } from 'framer-motion';
import styles from './BentoGrid.module.css';
import { 
  Users, Github, Eye, Box, Code2, Terminal, ShieldCheck, 
  FileCode, Folder, ChevronRight, ChevronDown, Plus, Search, 
  GitBranch, RefreshCw, Play, AlertCircle, MessageSquare,
  LockKeyhole, Activity, Database, Server, CheckCircle2
} from 'lucide-react';

const TechPill = ({ children }) => (
  <div className={styles.techPill}>{children}</div>
);

// Unified Window Chrome Component
const WindowHeader = ({ title, tabs, activeTab }) => (
  <div className={styles.mockHeader}>
    <div className={styles.macLights}>
      <div className={styles.lightRed} />
      <div className={styles.lightYellow} />
      <div className={styles.lightGreen} />
    </div>
    {tabs ? (
      <div className={styles.mockTabs}>
        {tabs.map((tab, i) => (
          <div key={i} className={i === activeTab ? styles.mockTabActive : styles.mockTab}>
            {tab.icon} {tab.name}
          </div>
        ))}
      </div>
    ) : (
      <div className={styles.mockTitle}>{title}</div>
    )}
  </div>
);

export default function BentoGrid() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.glowTop} />
      <div className={styles.header}>
        <div className={styles.badge}>
          <div className={styles.badgeDot} />
          FEATURES
        </div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.title}
        >
          Everything You Need to <br/>
          <span className={styles.gradientText}>Build Faster</span>
        </motion.h2>
      </div>

      <div className={styles.grid}>
        
        {/* 1. Real-time Collaboration (Span 4x2) */}
        <motion.div className={`${styles.card} ${styles.collabCard}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}><Users size={20} className={styles.icon} /></div>
            <h3 className={styles.cardTitle}>Real-time Collaboration</h3>
            <p className={styles.cardDesc}>Code with your team in real-time, exactly like Google Docs.</p>
            <div className={styles.techStack}><TechPill>Socket.IO</TechPill><TechPill>WebSockets</TechPill></div>
          </div>
          <div className={styles.illustrationArea}>
            <div className={`${styles.mockWindow} ${styles.collabMockWindow}`}>
              <WindowHeader 
                tabs={[
                  { name: 'server.ts', icon: <FileCode size={12} color="#4fc1ff"/> },
                  { name: 'auth.ts', icon: <FileCode size={12} color="#eab308"/> }
                ]} 
                activeTab={0} 
              />
              <div className={styles.mockBodyRow}>
                <div className={styles.mockSidebar}>
                  <div className={styles.sidebarSection}>EXPLORER</div>
                  <div className={styles.sidebarItem}><ChevronDown size={12}/> <Folder size={12} color="#3b82f6"/> src</div>
                  <div className={styles.sidebarItemActive} style={{paddingLeft: '24px'}}><FileCode size={12} color="#4fc1ff"/> server.ts</div>
                  <div className={styles.sidebarItem} style={{paddingLeft: '24px'}}><FileCode size={12} color="#eab308"/> auth.ts</div>
                </div>
                <div className={styles.mockCodeArea}>
                  <div className={styles.mockAvatars}>
                    <div className={styles.avatar} style={{background: '#3b82f6', zIndex: 3}}>S</div>
                    <div className={styles.avatar} style={{background: '#d946ef', zIndex: 2, marginLeft: '-8px'}}>A</div>
                  </div>
                  <div className={styles.codeLine}><span className={styles.kw}>import</span> {'{'} Server {'}'} <span className={styles.kw}>from</span> <span className={styles.str}>'socket.io'</span>;</div>
                  <div className={styles.codeLine}><span className={styles.kw}>const</span> io = <span className={styles.kw}>new</span> <span className={styles.fn}>Server</span>(3000, {'{'}</div>
                  <div className={styles.codeLineActive}>  cors: {'{'} <span className={styles.prop}>origin</span>: <span className={styles.str}>'*'</span> {'}'}</div>
                  <div className={styles.codeLine}>{'}'});</div>
                  <div className={styles.codeLine}>&nbsp;</div>
                  
                  {/* Active Line Highlight */}
                  <div className={styles.activeLineHighlight} style={{ top: '60px' }} />

                  {/* Comment Popover */}
                  <div className={styles.inlineComment} style={{ top: '75px', left: '140px' }}>
                    <div className={styles.commentHeader}><MessageSquare size={10}/> Sarah</div>
                    <div className={styles.commentBody}>Should we restrict origin?</div>
                  </div>

                  {/* Cursors */}
                  <div className={styles.cursorTyping} style={{ top: '60px', left: '130px' }}>
                    <div className={styles.caret} style={{ background: '#3b82f6' }}/>
                    <div className={styles.cursorLabel} style={{ background: '#3b82f6' }}>Sarah</div>
                  </div>

                  <div className={styles.cursorFloating} style={{ top: '20px', left: '220px', animationDelay: '1s' }}>
                    <div className={styles.caret} style={{ background: '#d946ef' }}/>
                    <div className={styles.cursorLabel} style={{ background: '#d946ef' }}>Alex</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. One-click Runtime (Span 2x1) */}
        <motion.div className={`${styles.card} ${styles.runtimeCard}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}><Terminal size={20} className={styles.icon} /></div>
            <h3 className={styles.cardTitle}>One-click Runtime</h3>
            <div className={styles.techStack}><TechPill>Node.js</TechPill></div>
          </div>
          <div className={styles.illustrationArea}>
            <div className={styles.mockWindow} style={{ width: '90%', height: '70%' }}>
              <WindowHeader title="Terminal - zsh" />
              <div className={styles.mockCodeArea} style={{ padding: '16px' }}>
                <div className={styles.termBlock}>
                  <div className={styles.termPrompt}><span>~/novus</span> <span style={{color: '#3b82f6'}}>❯</span> <span className={styles.termCmd}>npm install</span></div>
                  <div className={styles.termLogFade}>Installing dependencies...</div>
                  <div className={styles.termLogSuccess}>added 142 packages in 2s</div>
                </div>
                <div className={styles.termBlock}>
                  <div className={styles.termPrompt}><span>~/novus</span> <span style={{color: '#3b82f6'}}>❯</span> <span className={styles.termCmd}>vite dev</span></div>
                  <div className={styles.termLogFade}>Building project...</div>
                  <div className={styles.termLogSuccess}>VITE v4.0.0 ready in 142ms</div>
                  <div className={styles.termLogInfo}>➜  Local:   http://localhost:3000/ <span className={styles.blink}>█</span></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Docker Isolation (Span 2x1) */}
        <motion.div className={`${styles.card} ${styles.dockerCard}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}><Box size={20} className={styles.icon} /></div>
            <h3 className={styles.cardTitle}>Docker Isolation</h3>
            <div className={styles.techStack}><TechPill>Docker</TechPill></div>
          </div>
          <div className={styles.illustrationArea}>
            <div className={styles.mockWindow} style={{ width: '95%', height: '65%' }}>
              <WindowHeader title="Infrastructure Dashboard" />
              <div className={styles.mockCodeArea} style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div className={styles.tableHeader}>
                  <span>SERVICE</span><span>STATUS</span><span>CPU</span><span>RAM</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableName}><Box size={12}/> workspace</span>
                  <span className={styles.tableStatus}><div className={styles.statusDot}/> Running</span>
                  <span className={styles.tableMetricPulse}>1.2%</span>
                  <span className={styles.tableMetric}>245MB</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableName}><Database size={12}/> postgres</span>
                  <span className={styles.tableStatus}><div className={styles.statusDot}/> Running</span>
                  <span className={styles.tableMetricPulse} style={{animationDelay: '0.5s'}}>0.1%</span>
                  <span className={styles.tableMetric}>48MB</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableName}><Server size={12}/> redis</span>
                  <span className={styles.tableStatusBuild}><div className={styles.spinner}/> Building</span>
                  <span className={styles.tableMetric}>-</span>
                  <span className={styles.tableMetric}>-</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. Browser IDE (Span 6x2) */}
        <motion.div className={`${styles.card} ${styles.ideCard}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <div className={styles.cardHeaderFull}>
            <div className={styles.iconWrapper}><Code2 size={20} className={styles.icon} /></div>
            <div>
              <h3 className={styles.cardTitle}>Browser IDE</h3>
              <p className={styles.cardDesc}>A complete, VS Code-compatible development environment.</p>
            </div>
            <div className={styles.techStack} style={{marginLeft: 'auto'}}><TechPill>Monaco</TechPill><TechPill>xterm</TechPill></div>
          </div>
          <div className={styles.illustrationAreaFull}>
            <div className={styles.mockWindow} style={{ width: '95%', height: '90%' }}>
              <WindowHeader title="NovusIDE - Workspace" />
              <div className={styles.mockBodyRow}>
                {/* Activity Bar */}
                <div className={styles.mockActivityBar}>
                  <FileCode size={18} color="#ffffff"/>
                  <Search size={18} color="#64748b"/>
                  <GitBranch size={18} color="#64748b"/>
                  <Play size={18} color="#64748b"/>
                </div>
                {/* Explorer */}
                <div className={styles.mockSidebar} style={{ width: '180px' }}>
                  <div className={styles.sidebarSection}>EXPLORER</div>
                  <div className={styles.sidebarItem}><ChevronDown size={12}/> <Folder size={12} color="#3b82f6"/> src</div>
                  <div className={styles.sidebarItem} style={{paddingLeft: '24px'}}><ChevronDown size={12}/> <Folder size={12} color="#3b82f6"/> components</div>
                  <div className={styles.sidebarItemActive} style={{paddingLeft: '36px'}}><FileCode size={12} color="#4fc1ff"/> App.tsx</div>
                  <div className={styles.sidebarItem} style={{paddingLeft: '36px'}}><FileCode size={12} color="#eab308"/> styles.css</div>
                  <div className={styles.sidebarItem}><ChevronRight size={12}/> <Folder size={12} color="#8b5cf6"/> node_modules</div>
                  <div className={styles.sidebarItem}><FileCode size={12} color="#22c55e"/> package.json</div>
                </div>
                {/* Main Editor Area */}
                <div className={styles.mockMainColumn}>
                  <div className={styles.mockBodyRow} style={{ flex: 2 }}>
                    {/* Editor */}
                    <div className={styles.mockCodeArea} style={{ flex: 1, borderRight: '1px solid #1e293b' }}>
                      <div className={styles.mockTabs}>
                        <div className={styles.mockTabActive}><FileCode size={12} color="#4fc1ff"/> App.tsx</div>
                        <div className={styles.mockTab}><FileCode size={12} color="#eab308"/> styles.css</div>
                      </div>
                      <div className={styles.mockCodeContent}>
                        <div className={styles.codeLine}><span className={styles.kw}>export default function</span> <span className={styles.fn}>App</span>() {'{'}</div>
                        <div className={styles.codeLine}>  <span className={styles.kw}>return</span> (</div>
                        <div className={styles.codeLine}>    &lt;<span className={styles.html}>div</span> <span className={styles.attr}>className</span>=<span className={styles.str}>"app"</span>&gt;</div>
                        <div className={styles.codeLine}>      &lt;<span className={styles.html}>h1</span>&gt;Hello World&lt;/<span className={styles.html}>h1</span>&gt;</div>
                        <div className={styles.codeLine}>    &lt;/<span className={styles.html}>div</span>&gt;</div>
                        <div className={styles.codeLine}>  );</div>
                        <div className={styles.codeLine}>{'}'}</div>
                        <div className={styles.cursorTyping} style={{ top: '120px', left: '30px' }}><div className={styles.caret} style={{background: '#3b82f6'}}/></div>
                      </div>
                    </div>
                    {/* Live Preview Pane */}
                    <div className={styles.mockPreviewArea}>
                      <div className={styles.mockTabs}>
                        <div className={styles.mockTabActive}><Eye size={12}/> Preview - localhost:3000</div>
                      </div>
                      <div className={styles.previewIframe}>
                        <div className={styles.previewApp}>
                          <div className={styles.previewBox}>Hello World</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Terminal Panel */}
                  <div className={styles.mockTerminalArea}>
                    <div className={styles.mockTabs} style={{ height: '30px', minHeight: '30px' }}>
                      <div className={styles.mockTab}>PROBLEMS</div>
                      <div className={styles.mockTab}>OUTPUT</div>
                      <div className={styles.mockTabActive}>TERMINAL</div>
                    </div>
                    <div className={styles.termBlock} style={{ padding: '12px 16px' }}>
                      <div className={styles.termPrompt}><span>~/app</span> <span style={{color: '#3b82f6'}}>❯</span> <span className={styles.termCmd}>npm run start</span></div>
                      <div className={styles.termLogSuccess}>✓ Ready in 120ms</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Status Bar */}
              <div className={styles.mockStatusBar}>
                <div className={styles.statusLeft}>
                  <span><GitBranch size={12}/> main*</span>
                  <span><RefreshCw size={12}/></span>
                  <span><AlertCircle size={12}/> 0</span>
                </div>
                <div className={styles.statusRight}>
                  <span>Ln 8, Col 1</span>
                  <span>UTF-8</span>
                  <span>TypeScript React</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 5. GitHub Import (Span 3x1) */}
        <motion.div className={`${styles.card} ${styles.githubCard}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}><Github size={20} className={styles.icon} /></div>
            <h3 className={styles.cardTitle}>GitHub Import</h3>
            <div className={styles.techStack}><TechPill>Git</TechPill></div>
          </div>
          <div className={styles.illustrationArea}>
            <div className={styles.mockWindow} style={{ width: '85%', height: '75%', bottom: '-10px', right: '20px' }}>
              <WindowHeader title="Import Git Repository" />
              <div className={styles.mockCodeArea} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.importSearch}>
                  <Search size={14} color="#64748b"/>
                  <span>Find repository...</span>
                </div>
                <div className={styles.importRepoRow}>
                  <div className={styles.repoLeft}>
                    <Github size={16}/>
                    <div className={styles.repoText}>
                      <div className={styles.repoName}>novuside / starter-app</div>
                      <div className={styles.repoMeta}>Updated 2m ago</div>
                    </div>
                  </div>
                  <div className={styles.repoRight}>
                    <div className={styles.repoBtn}>Import</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6. Live Preview (Span 3x1) */}
        <motion.div className={`${styles.card} ${styles.previewCard}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}><Eye size={20} className={styles.icon} /></div>
            <h3 className={styles.cardTitle}>Live Preview</h3>
            <div className={styles.techStack}><TechPill>React</TechPill></div>
          </div>
          <div className={styles.illustrationArea}>
            <div className={styles.mockWindow} style={{ width: '90%', height: '80%', bottom: 0, right: '-10px' }}>
              <div className={styles.mockHeader}>
                <div className={styles.macLights}>
                  <div className={styles.lightRed} />
                  <div className={styles.lightYellow} />
                  <div className={styles.lightGreen} />
                </div>
                <div className={styles.browserTabs}>
                  <div className={styles.browserTabActive}>
                    <div className={styles.favicon}/> NovusIDE App
                  </div>
                  <div className={styles.browserTab}>
                    <div className={styles.favicon} style={{background: '#8b5cf6'}}/> Docs
                  </div>
                </div>
              </div>
              <div className={styles.browserNav}>
                <div className={styles.browserNavBtns}>
                  <ChevronRight size={14} style={{transform: 'rotate(180deg)'}}/>
                  <ChevronRight size={14}/>
                  <RefreshCw size={14} className={styles.spinner}/>
                </div>
                <div className={styles.browserUrl}>
                  <LockKeyhole size={10} color="#10b981"/> localhost:3000
                </div>
              </div>
              <div className={styles.mockCodeArea} style={{ padding: '0' }}>
                <div className={styles.renderedApp}>
                  <div className={styles.renderedSidebar}/>
                  <div className={styles.renderedMain}>
                    <div className={styles.renderedHeader}/>
                    <div className={styles.renderedContentPulse}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7. Secure Sessions (Span 6x1) */}
        <motion.div className={`${styles.card} ${styles.secureCard}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <div className={styles.secureContent}>
            <div className={styles.secureText}>
              <div className={styles.iconWrapper}><ShieldCheck size={20} className={styles.icon} /></div>
              <h3 className={styles.cardTitle}>Secure Sessions</h3>
              <p className={styles.cardDesc}>Encrypted WebSocket connections over WSS / TLS.</p>
              <div className={styles.techStack}><TechPill>TLS</TechPill><TechPill>JWT</TechPill></div>
            </div>
            
            <div className={styles.secureMonitor}>
              <div className={styles.monitorNode}><Activity size={16}/> Browser</div>
              
              <div className={styles.monitorFlow}>
                <div className={styles.monitorMetric}>Encrypted</div>
                <div className={styles.monitorPipe}>
                  <div className={styles.monitorPacket} />
                  <div className={styles.monitorPacket} style={{animationDelay: '0.4s'}} />
                  <div className={styles.monitorPacket} style={{animationDelay: '0.8s'}} />
                </div>
                <div className={styles.monitorTags}>
                  <span className={styles.monitorTagOk}>101 WSS</span>
                  <span className={styles.monitorTag}>TLS 1.3</span>
                </div>
              </div>
              
              <div className={styles.monitorNode}><Database size={16}/> Workspace</div>
            </div>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
