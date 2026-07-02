import React from 'react';
import { motion } from 'framer-motion';
import styles from './BentoGrid.module.css';
import { Users, Github, Zap, Eye, Box, Lock, Code2 } from 'lucide-react';

const FEATURES = [
  { 
    id: 'collab', 
    title: 'Real-time Collaboration', 
    icon: Users, 
    desc: 'Multiplayer coding with live cursors and presence.', 
    span: 2,
    illustration: (
      <div className={styles.collabIll}>
        <div className={styles.cursor} style={{ background: '#3b82f6', top: '20%', left: '30%' }} />
        <div className={styles.cursor} style={{ background: '#d946ef', top: '60%', left: '60%' }} />
      </div>
    )
  },
  { 
    id: 'github', 
    title: 'GitHub Import', 
    icon: Github, 
    desc: 'Clone and setup any repo instantly.', 
    span: 1,
    illustration: (
      <div className={styles.gitIll}>
        <div className={styles.gitLine} />
        <div className={styles.gitNode} />
      </div>
    )
  },
  { 
    id: 'runtime', 
    title: 'One-click Runtime', 
    icon: Zap, 
    desc: 'Spin up a containerized dev environment.', 
    span: 1,
    illustration: (
      <div className={styles.zapIll}>
        <div className={styles.glowOrb} />
      </div>
    )
  },
  { 
    id: 'preview', 
    title: 'Live Preview', 
    icon: Eye, 
    desc: 'See your changes instantly in a side-by-side browser.', 
    span: 2,
    illustration: (
      <div className={styles.previewIll}>
        <div className={styles.browserBar}>
          <div className={styles.dots} />
        </div>
      </div>
    )
  },
  { 
    id: 'docker', 
    title: 'Docker Isolation', 
    icon: Box, 
    desc: 'Every workspace runs in an isolated container.', 
    span: 1,
    illustration: <div className={styles.boxIll} />
  },
  { 
    id: 'secure', 
    title: 'Secure Sessions', 
    icon: Lock, 
    desc: 'End-to-end encrypted WebSocket connections.', 
    span: 1,
    illustration: <div className={styles.lockIll} />
  },
  { 
    id: 'ide', 
    title: 'Browser IDE', 
    icon: Code2, 
    desc: 'VS Code-like experience entirely in your browser.', 
    span: 1,
    illustration: (
      <div className={styles.codeIll}>
        <div className={styles.codeLine} style={{width: '80%'}}/>
        <div className={styles.codeLine} style={{width: '60%'}}/>
        <div className={styles.codeLine} style={{width: '40%'}}/>
      </div>
    )
  }
];

export default function BentoGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.glowTop} />
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
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <feature.icon size={24} className={styles.icon} />
              </div>
              <div className={styles.illustrationContainer}>
                {feature.illustration}
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
