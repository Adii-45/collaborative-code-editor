import React from 'react';
import { motion } from 'framer-motion';
import styles from './FeatureShowcase.module.css';
import { Check, ChevronRight } from 'lucide-react';

const SHOWCASES = [
  {
    title: 'Multiplayer Editing',
    description: 'Code with your team in real time. See exactly who is typing where, follow live cursors, and brainstorm solutions inside the same file.',
    features: ['Real-time sync over WebSockets', 'Live cursors and presence', 'See who is editing, as it happens'],
    badge: 'Live',
    badgeColor: '#10b981', // green
    reversed: false
  },
  {
    title: 'Isolated Workspaces',
    description: 'No more "it works on my machine". Every project runs in its own isolated workspace, with dedicated Docker containers on the roadmap for stronger sandboxing.',
    features: ['Isolated per-project workspace', 'Your own terminal, per project', 'Docker container support (roadmap)'],
    badge: 'Secure',
    badgeColor: '#8b5cf6', // purple
    reversed: true
  }
];

export default function FeatureShowcase() {
  return (
    <section className={styles.section}>
      {SHOWCASES.map((showcase, index) => (
        <div key={index} className={`${styles.row} ${showcase.reversed ? styles.reversed : ''}`}>
          <motion.div 
            className={styles.textContent}
            initial={{ opacity: 0, x: showcase.reversed ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className={styles.title}>{showcase.title}</h3>
            <p className={styles.description}>{showcase.description}</p>
            
            <ul className={styles.featureList}>
              {showcase.features.map((feat, i) => (
                <li key={i} className={styles.featureItem}>
                  <Check size={16} className={styles.checkIcon} />
                  {feat}
                </li>
              ))}
            </ul>

            <button className={styles.ctaBtn}>
              Learn more <ChevronRight size={14} />
            </button>
          </motion.div>

          <motion.div 
            className={styles.visualContent}
            initial={{ opacity: 0, x: showcase.reversed ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.mockupPlaceholder}>
              <div className={styles.mockupHeader}>
                <div className={styles.dots}>
                  <div className={styles.dot} style={{background: '#ff5f56'}}/>
                  <div className={styles.dot} style={{background: '#ffbd2e'}}/>
                  <div className={styles.dot} style={{background: '#27c93f'}}/>
                </div>
              </div>
              <div className={styles.mockupBody}>
                {/* Simulated UI based on section */}
                <div className={styles.simulatedCode}>
                  <div className={styles.codeLine} style={{width: '60%'}}/>
                  <div className={styles.codeLine} style={{width: '80%'}}/>
                  <div className={styles.codeLine} style={{width: '40%'}}/>
                  <div className={styles.codeLine} style={{width: '90%'}}/>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div 
                className={styles.floatingBadge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                style={{ borderColor: showcase.badgeColor }}
              >
                <div className={styles.badgeDot} style={{ background: showcase.badgeColor }} />
                {showcase.badge}
              </motion.div>
            </div>
            {/* Glowing backdrop */}
            <div className={styles.glow} style={{ background: `radial-gradient(circle, ${showcase.badgeColor}33 0%, transparent 70%)` }} />
          </motion.div>
        </div>
      ))}
    </section>
  );
}
