import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AnimatedIDE.module.css';
import { Code2, Terminal, Layout, FileJson, GitCommit, CheckCircle2, Play } from 'lucide-react';

const CODE_SNIPPETS = {
  default: `import { CollaborativeEditor } from "./Editor";

export default function App() {
  return (
    <div className="workspace">
      <header>
        <h1>NovusIDE Workspace</h1>
      </header>
      <CollaborativeEditor />
    </div>
  );
}`,
  collab: `import { RoomProvider, usePresence } from "./realtime";
import { CollaborativeEditor } from "./Editor";

export default function App() {
  const others = usePresence();
  
  return (
    <RoomProvider id="novus-room-1">
      <div className="workspace">
        <header>
          <h1>NovusIDE Workspace</h1>
          <div className="avatars">
            {others.map(user => (
              <Avatar key={user.connectionId} info={user.info} />
            ))}
          </div>
        </header>
        <CollaborativeEditor />
      </div>
    </RoomProvider>
  );
}`
};

const COLLABORATORS = [
  { name: 'Sarah', color: '#d946ef', action: 'is typing' },
  { name: 'Alex', color: '#3b82f6', action: 'joined workspace' },
  { name: 'Emma', color: '#10b981', action: 'reviewing code' },
  { name: 'Aditya', color: '#f59e0b', action: 'committed changes' },
];

export default function AnimatedIDE({ currentPhrase }) {
  const [codeTypeLength, setCodeTypeLength] = useState(CODE_SNIPPETS.default.length);
  const [currentSnippet, setCurrentSnippet] = useState(CODE_SNIPPETS.default);
  const [terminalLogs, setTerminalLogs] = useState(["$ node -v", "v20.10.0"]);
  const [activeToasts, setActiveToasts] = useState([]);
  const [previewState, setPreviewState] = useState(0); // 0: loading, 1: basic, 2: advanced
  const [showCursors, setShowCursors] = useState(false);

  // Sync IDE with Hero Phrase
  useEffect(() => {
    if (!currentPhrase) return;

    if (currentPhrase === "Import Any Repository.") {
      setTerminalLogs(prev => [...prev, "$ git clone https://github.com/novus/app.git", "Cloning into 'app'...", "Resolving deltas: 100% (42/42), done."]);
      setPreviewState(0);
      setShowCursors(false);
    } 
    else if (currentPhrase === "Collaborate Live." || currentPhrase === "Code Together." || currentPhrase === "Built for Teams.") {
      // Simulate live collab editing
      setCurrentSnippet(CODE_SNIPPETS.collab);
      setCodeTypeLength(CODE_SNIPPETS.default.length);
      setShowCursors(true);
      addToast({ name: 'Alex', color: '#3b82f6', action: 'joined workspace' });
      setTimeout(() => addToast({ name: 'Sarah', color: '#d946ef', action: 'is typing in App.tsx' }), 1000);
      
      // Auto-type the new code
      let i = CODE_SNIPPETS.default.length;
      const typeInterval = setInterval(() => {
        i++;
        setCodeTypeLength(i);
        if (i >= CODE_SNIPPETS.collab.length) clearInterval(typeInterval);
      }, 30);
    } 
    else if (currentPhrase === "Run Projects Instantly." || currentPhrase === "Build Faster.") {
      setTerminalLogs(prev => [...prev, "$ npm run dev", "Starting development server...", "Ready in 1250ms", "➜  Local:   http://localhost:5173/"]);
    } 
    else if (currentPhrase === "Preview Changes Live.") {
      setTerminalLogs(prev => [...prev, "Hot reload complete."]);
      setPreviewState(2);
      addToast({ name: 'System', color: '#10b981', action: 'Preview updated successfully' });
    } 
    else if (currentPhrase === "Ship Better Software.") {
      setTerminalLogs(prev => [...prev, "$ git commit -m 'feat: live collab'", "[main a1b2c3d] feat: live collab"]);
      addToast({ name: 'Aditya', color: '#f59e0b', action: 'pushed to main' });
    }
  }, [currentPhrase]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setActiveToasts(prev => [...prev.slice(-2), { id, ...toast }]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const highlightCode = (text) => {
    const keywords = ['import', 'from', 'export', 'default', 'function', 'const', 'return'];
    const components = ['App', 'RoomProvider', 'CollaborativeEditor', 'Avatar'];
    
    let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
    keywords.forEach(kw => {
      html = html.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span class="${styles.keyword}">${kw}</span>`);
    });
    
    components.forEach(comp => {
      html = html.replace(new RegExp(`\\b${comp}\\b`, 'g'), `<span class="${styles.component}">${comp}</span>`);
    });

    html = html.replace(/("[^"]*")/g, `<span class="${styles.string}">$1</span>`);
    
    return { __html: html };
  };

  const displayedCode = currentSnippet.substring(0, codeTypeLength);

  return (
    <div className={styles.ideContainer}>
      {/* Main IDE Window */}
      <div className={styles.ideWindow}>
        {/* Header */}
        <div className={styles.ideHeader}>
          <div className={styles.windowControls}>
            <div className={styles.dot} style={{ background: '#ff5f56' }} />
            <div className={styles.dot} style={{ background: '#ffbd2e' }} />
            <div className={styles.dot} style={{ background: '#27c93f' }} />
          </div>
          <div className={styles.headerTabs}>
            <div className={`${styles.tab} ${styles.activeTab}`}><Code2 size={14}/> App.tsx</div>
            <div className={styles.tab}><FileJson size={14}/> package.json</div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.presenceAvatars}>
              {showCursors && (
                <>
                  <div className={styles.avatar} style={{ borderColor: '#d946ef' }}>S</div>
                  <div className={styles.avatar} style={{ borderColor: '#3b82f6', marginLeft: '-8px' }}>A</div>
                </>
              )}
            </div>
            <div className={styles.liveBadge}>LIVE</div>
          </div>
        </div>

        <div className={styles.ideBody}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle}>EXPLORER</div>
            <div className={styles.fileTree}>
              <div className={styles.treeItem}><Layout size={14}/> src</div>
              <div className={`${styles.treeItem} ${styles.activeTreeItem}`} style={{ paddingLeft: '24px' }}>
                <Code2 size={14}/> App.tsx
              </div>
              <div className={styles.treeItem} style={{ paddingLeft: '24px' }}>
                <Code2 size={14}/> Editor.tsx
              </div>
              <div className={styles.treeItem}><FileJson size={14}/> package.json</div>
            </div>
          </div>

          {/* Editor & Preview Split */}
          <div className={styles.mainArea}>
            <div className={styles.editorSplit}>
              {/* Code Editor */}
              <div className={styles.editorPanel}>
                <div className={styles.lineNumbers}>
                  {displayedCode.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className={styles.codeContent}>
                  <div 
                    dangerouslySetInnerHTML={highlightCode(displayedCode)} 
                    style={{ whiteSpace: 'pre', display: 'inline' }}
                  />
                  <motion.span 
                    className={styles.blinkingCursor}
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                  
                  {/* Floating Collaborator Cursor */}
                  {showCursors && (
                    <motion.div 
                      className={styles.collabCursor}
                      initial={{ opacity: 0, x: 200, y: 150 }}
                      animate={{ opacity: 1, x: 120, y: 80 }}
                      transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    >
                      <div className={styles.cursorPoint} style={{ backgroundColor: '#d946ef' }} />
                      <div className={styles.cursorLabel} style={{ backgroundColor: '#d946ef' }}>Sarah</div>
                    </motion.div>
                  )}
                  {showCursors && (
                    <motion.div 
                      className={styles.collabCursor}
                      initial={{ opacity: 0, x: 50, y: 50 }}
                      animate={{ opacity: 1, x: 250, y: 120 }}
                      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 1 }}
                    >
                      <div className={styles.cursorPoint} style={{ backgroundColor: '#3b82f6' }} />
                      <div className={styles.cursorLabel} style={{ backgroundColor: '#3b82f6' }}>Alex</div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Live Preview */}
              <div className={styles.previewPanel}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewAddress}>localhost:5173</div>
                </div>
                <div className={styles.previewBody}>
                  {previewState === 0 ? (
                    <div className={styles.loadingSpinner} />
                  ) : (
                    <motion.div 
                      className={styles.mockApp}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={styles.mockAppHeader}>
                        <div className={styles.mockAppLogo} style={{ background: previewState === 2 ? '#3b82f6' : '#cbd5e1' }} />
                        <div className={styles.mockAppAvatars}>
                          <div className={styles.mockAvatar} />
                          {previewState === 2 && <div className={styles.mockAvatar} style={{ background: '#d946ef' }}/>}
                        </div>
                      </div>
                      <div className={styles.mockAppBody}>
                        <motion.div className={styles.mockLine} style={{ width: '80%' }} layout />
                        <motion.div className={styles.mockLine} style={{ width: '60%' }} layout />
                        {previewState === 2 && (
                           <motion.div className={styles.mockLine} style={{ width: '90%', background: '#06b6d4' }} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} />
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Terminal */}
            <div className={styles.terminalPanel}>
              <div className={styles.terminalHeader}>
                <Terminal size={12} /> OUTPUT
              </div>
              <div className={styles.terminalContent}>
                {terminalLogs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={log.startsWith('✓') || log.includes('successfully') ? styles.termSuccess : log.startsWith('$') ? styles.termCommand : styles.termText}
                  >
                    {log}
                  </motion.div>
                ))}
                <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className={styles.termCursor}>█</motion.span>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications Overlay */}
        <div className={styles.toastContainer}>
          <AnimatePresence>
            {activeToasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={styles.toast}
              >
                <div className={styles.toastDot} style={{ backgroundColor: toast.color }} />
                <span style={{ color: 'white', fontWeight: 600 }}>{toast.name}</span> {toast.action}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
