import React from 'react';
import { motion } from 'framer-motion';
import styles from './FeatureShowcase.module.css';

const SHOWCASES = [
  {
    title: 'Multiplayer Editing',
    description: 'Code with your team in real-time. See exactly who is typing where, resolve conflicts before they happen, and brainstorm solutions inside the same file. Powered by Yjs and Liveblocks for zero latency.',
    visual: 'Mockup 1',
    reversed: false
  },
  {
    title: 'Instant GitHub Imports',
    description: 'Paste any GitHub URL and have a fully running development environment in seconds. We automatically detect your framework, install dependencies, and start your server.',
    visual: 'Mockup 2',
    reversed: true
  },
  {
    title: 'Isolated Docker Environments',
    description: 'No more "it works on my machine". Every workspace runs in its own secure, isolated Docker container with root access. Customize your environment with standard Dockerfiles.',
    visual: 'Mockup 3',
    reversed: false
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
            </div>
            {/* Glowing backdrop */}
            <div className={styles.glow} />
          </motion.div>
        </div>
      ))}
    </section>
  );
}
