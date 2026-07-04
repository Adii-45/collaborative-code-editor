import React from 'react';
import { motion } from 'framer-motion';
import styles from './DevExperience.module.css';
import { Code2, Users, Zap, Play, Github, Server } from 'lucide-react';

const CAPABILITIES = [
  { value: 'Monaco', label: 'VS Code Editor', sub: 'The same engine that powers VS Code', icon: Code2 },
  { value: 'Socket.IO', label: 'Real-Time Sync', sub: 'Live cursors, presence & instant updates', icon: Users },
  { value: 'In-Browser', label: 'Zero Install', sub: 'Runs entirely in your browser', icon: Zap },
  { value: '1-Click', label: 'Instant Run', sub: 'Install dependencies and run in a click', icon: Play },
  { value: 'GitHub', label: 'Repo Import', sub: 'Clone any repository straight from Git', icon: Github },
  { value: 'Self-Host', label: 'Open Source', sub: 'Run NovusIDE on your own infrastructure', icon: Server }
];

export default function DevExperience() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.title}
        >
          Built on a <span className={styles.gradientText}>Real Developer Stack</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          No black boxes. NovusIDE is built on open, familiar tools — the same editor as VS Code, real-time sync over WebSockets, and Git-native imports.
        </motion.p>
      </div>

      <div className={styles.grid}>
        {CAPABILITIES.map((cap, i) => (
          <motion.div
            key={i}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.iconWrapper}>
              <cap.icon size={20} className={styles.icon} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{cap.value}</div>
              <div className={styles.statLabel}>{cap.label}</div>
              <div className={styles.statSub}>{cap.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
