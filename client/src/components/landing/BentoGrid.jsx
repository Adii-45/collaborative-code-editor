import React from 'react';
import { motion } from 'framer-motion';
import styles from './BentoGrid.module.css';
import { Users, Github, Zap, Eye, Box, Lock, Code2, Terminal } from 'lucide-react';

const FEATURES = [
  { id: 'collab', title: 'Real-time Collaboration', icon: Users, desc: 'Multiplayer coding with live cursors and presence.', span: 2 },
  { id: 'github', title: 'GitHub Import', icon: Github, desc: 'Clone and setup any repo instantly.', span: 1 },
  { id: 'runtime', title: 'One-click Runtime', icon: Zap, desc: 'Spin up a containerized dev environment.', span: 1 },
  { id: 'preview', title: 'Live Preview', icon: Eye, desc: 'See your changes instantly in a side-by-side browser.', span: 2 },
  { id: 'docker', title: 'Docker Isolation', icon: Box, desc: 'Every workspace runs in an isolated container.', span: 1 },
  { id: 'secure', title: 'Secure Sessions', icon: Lock, desc: 'End-to-end encrypted WebSocket connections.', span: 1 },
  { id: 'ide', title: 'Browser IDE', icon: Code2, desc: 'VS Code-like experience in your browser.', span: 2 }
];

export default function BentoGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.title}
        >
          Why Choose <span className={styles.gradientText}>NovusIDE</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          Everything you need to build software faster, packed into a single premium platform.
        </motion.p>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.id}
            className={`${styles.card} ${feature.span === 2 ? styles.span2 : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.iconWrapper}>
              <feature.icon size={24} className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDesc}>{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
