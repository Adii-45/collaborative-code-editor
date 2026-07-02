import React from 'react';
import { motion } from 'framer-motion';
import styles from './HowItWorks.module.css';
import { DownloadCloud, Box, UserPlus, Users, Play, Rocket } from 'lucide-react';

const STEPS = [
  { icon: DownloadCloud, title: 'Import Repository', delay: 0 },
  { icon: Box, title: 'Workspace Created', delay: 0.2 },
  { icon: UserPlus, title: 'Invite Team', delay: 0.4 },
  { icon: Users, title: 'Collaborate', delay: 0.6 },
  { icon: Play, title: 'Run Project', delay: 0.8 },
  { icon: Rocket, title: 'Deploy', delay: 1.0 }
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.title}
        >
          How It Works
        </motion.h2>
      </div>

      <div className={styles.timeline}>
        <div className={styles.lineWrapper}>
          <motion.div 
            className={styles.animatedLine}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={i} className={styles.stepContainer}>
              <motion.div 
                className={styles.node}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay, type: 'spring', stiffness: 200 }}
              >
                <step.icon size={20} className={styles.icon} />
              </motion.div>
              <motion.div 
                className={styles.stepTitle}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay + 0.1 }}
              >
                {step.title}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
