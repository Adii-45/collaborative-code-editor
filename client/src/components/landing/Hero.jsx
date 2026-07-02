import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import { ChevronRight, Play, Terminal, Code2, GitCommit } from 'lucide-react';

const AnimatedCursor = ({ x, y, name, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: x - 50, y: y + 50 }}
    animate={{ opacity: 1, x, y }}
    transition={{ delay, duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
    className={styles.animatedCursor}
    style={{ '--cursor-color': color }}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 14.5L14 8L1.5 1.5L4 10.5L2.5 14.5Z" fill={color} />
    </svg>
    <span className={styles.cursorName} style={{ backgroundColor: color }}>{name}</span>
  </motion.div>
);

const IdeMockup = () => {
  return (
    <div className={styles.ideContainer}>
      <div className={styles.ideHeader}>
        <div className={styles.windowControls}>
          <div className={styles.macBtn} style={{ backgroundColor: '#ff5f56' }} />
          <div className={styles.macBtn} style={{ backgroundColor: '#ffbd2e' }} />
          <div className={styles.macBtn} style={{ backgroundColor: '#27c93f' }} />
        </div>
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${styles.activeTab}`}>
            <Code2 size={14} /> editor.tsx
          </div>
          <div className={styles.tab}>
            <Terminal size={14} /> build
          </div>
        </div>
        <div className={styles.ideCollaborators}>
          <div className={styles.avatar} style={{ backgroundColor: '#d946ef' }}>S</div>
          <div className={styles.avatar} style={{ backgroundColor: '#3b82f6' }}>A</div>
          <div className={styles.avatar} style={{ backgroundColor: '#10b981' }}>R</div>
          <div className={styles.liveBadge}>LIVE</div>
        </div>
      </div>
      
      <div className={styles.ideBody}>
        <div className={styles.sidebar}>
          <div className={styles.fileItem}><Code2 size={14} /> editor.tsx</div>
          <div className={styles.fileItem}><Code2 size={14} /> types.ts</div>
          <div className={styles.fileItem}><Code2 size={14} /> utils.ts</div>
          <div className={styles.fileItem}><Code2 size={14} /> hooks.ts</div>
          <div className={styles.fileItem}><Code2 size={14} /> api.ts</div>
        </div>
        <div className={styles.editorContent}>
          <div className={styles.codeLine}><span className={styles.keyword}>import</span> {'{'} Liveblocks {'}'} <span className={styles.keyword}>from</span> <span className={styles.string}>'@liveblocks/react'</span></div>
          <div className={styles.codeLine}><span className={styles.keyword}>import</span> {'{'} Yjs {'}'} <span className={styles.keyword}>from</span> <span className={styles.string}>'yjs'</span></div>
          <br />
          <div className={styles.codeLine}><span className={styles.comment}>// Real-time collaboration · 12 active users</span></div>
          <div className={styles.codeLine}><span className={styles.keyword}>export default function</span> <span className={styles.function}>CodeEditor</span>() {'{'}</div>
          <div className={styles.codeLine}>&nbsp;&nbsp;<span className={styles.keyword}>const</span> others = <span className={styles.function}>useOthers</span>();</div>
          <div className={styles.codeLine}>&nbsp;&nbsp;<span className={styles.keyword}>const</span> awareness = <span className={styles.function}>useYjsAwareness</span>();</div>
          <br />
          <div className={styles.codeLine}>&nbsp;&nbsp;<span className={styles.keyword}>return</span> &lt;<span className={styles.component}>Editor</span> <span className={styles.prop}>awareness</span>={'{'}awareness{'}'} /&gt;</div>
          <div className={styles.codeLine}>{'}'}</div>

          <AnimatedCursor x={80} y={120} name="Alex" color="#3b82f6" delay={0.5} />
          <AnimatedCursor x={220} y={160} name="Sarah" color="#d946ef" delay={1.2} />
          <AnimatedCursor x={140} y={200} name="Riya" color="#10b981" delay={2.1} />
        </div>
      </div>
      
      {/* Floating Notifications */}
      <motion.div 
        className={styles.floatingNotification}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
        style={{ right: '-20px', top: '100px' }}
      >
        <GitCommit size={14} />
        <span>Sarah pushed to main</span>
      </motion.div>
    </div>
  );
};

export default function Hero() {
  return (
    <section className={styles.heroWrapper}>
      <div className={styles.backgroundEffects}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.gridOverlay}></div>
      </div>

      <div className={styles.contentContainer}>
        <motion.div 
          className={styles.heroText}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className={styles.badge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className={styles.badgeDot}></span>
            Trusted by 50+ Developers & Startups
          </motion.div>

          <h1 className={styles.headline}>
            Build your <br />
            <span className={styles.gradientText}>Visualize Together</span>
            <span className={styles.blinkingCursor}>_</span>
          </h1>

          <p className={styles.description}>
            A blazing-fast collaborative IDE with <span className={styles.highlightPink}>AI-powered coding</span>, <span className={styles.highlightPink}>real-time collaboration</span>, 
            <span className={styles.highlightBlue}> proctored contests</span>, and infinite canvas — all in one platform.
          </p>

          <div className={styles.ctaGroup}>
            <Link to="/signup" className={styles.primaryBtn}>
              Start Coding Free
              <ChevronRight size={18} />
            </Link>
            <button className={styles.secondaryBtn}>
              <Play size={18} />
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          className={styles.heroVisual}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        >
          <IdeMockup />
        </motion.div>
      </div>
    </section>
  );
}
