import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './IDEPreview.module.css';
import { Sparkles, TerminalSquare, Code } from 'lucide-react';

export default function IDEPreview() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className={styles.previewSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={14} className={styles.sparkleIcon} />
            AI-POWERED CODING
          </div>
          <h2 className={styles.title}>Your AI Pair Programmer</h2>
          <p className={styles.subtitle}>
            NexusAI reads your entire codebase, understands context, and makes 
            surgical edits via natural language commands. Ghost suggestions appear 
            inline as you type — press Tab to accept.
          </p>
        </div>

        <motion.div style={{ y }} className={styles.mockupContainer}>
          <div className={styles.mockupHeader}>
            <div className={styles.controls}>
              <div className={styles.dot} style={{ backgroundColor: '#ff5f56' }} />
              <div className={styles.dot} style={{ backgroundColor: '#ffbd2e' }} />
              <div className={styles.dot} style={{ backgroundColor: '#27c93f' }} />
            </div>
            <div className={styles.tabs}>
              <div className={styles.tab}><TerminalSquare size={14}/> NexusAI Chat</div>
              <div className={styles.tab}><Code size={14}/> Ghost Suggestions</div>
            </div>
          </div>
          <div className={styles.mockupBody}>
            <div className={styles.chatArea}>
              <div className={styles.messageRow}>
                <div className={styles.aiAvatar}><Sparkles size={14}/></div>
                <div className={styles.aiMessage}>
                  I found a memory leak in <code>useWebSocket.ts</code>. The event listener 
                  isn't cleaned up on unmount. Want me to fix it?
                </div>
              </div>
              <div className={styles.messageRow} style={{ justifyContent: 'flex-end' }}>
                <div className={styles.userMessage}>
                  Yes, fix it and add proper cleanup + tests.
                </div>
              </div>
              <div className={styles.messageRow}>
                <div className={styles.aiAvatar}><Sparkles size={14}/></div>
                <div className={styles.aiMessageSuccess}>
                  <div className={styles.successHeader}>✓ Fixed useWebSocket.ts</div>
                  <div className={styles.successBody}>Added return cleanup function, wrote 3 unit tests.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
