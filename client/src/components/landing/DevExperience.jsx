import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './DevExperience.module.css';
import { LayoutGrid, Zap, Box, FolderDot, Users, Activity } from 'lucide-react';

const STATS = [
  { label: 'Workspaces Created', target: 145000, suffix: '+', icon: LayoutGrid, sub: 'Containers spawned' },
  { label: 'Latency', target: 12, suffix: 'ms', icon: Zap, sub: 'Global average' },
  { label: 'Docker Runtime', target: 1.2, suffix: 's', isFloat: true, icon: Box, sub: 'Cold start time' },
  { label: 'Projects', target: 850000, suffix: '+', icon: FolderDot, sub: 'Active repositories' },
  { label: 'Collaborators', target: 450000, suffix: '+', icon: Users, sub: 'Daily active users' },
  { label: 'Uptime', target: 99.99, suffix: '%', isFloat: true, icon: Activity, sub: 'Enterprise SLA' }
];

const AnimatedCounter = ({ target, suffix, isFloat }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentCount = easeOut * target;
        
        setCount(isFloat ? currentCount.toFixed(2) : Math.floor(currentCount));

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    }
  }, [isInView, target, isFloat]);

  return (
    <div ref={ref} className={styles.statValue}>
      {isFloat ? count : Number(count).toLocaleString()}{suffix}
    </div>
  );
};

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
          Scale Your <span className={styles.gradientText}>Developer Experience</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          Built for scale from day one. NovusIDE handles the heavy lifting so your team can focus on shipping.
        </motion.p>
      </div>

      <div className={styles.grid}>
        {STATS.map((stat, i) => (
          <motion.div 
            key={i} 
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.iconWrapper}>
              <stat.icon size={20} className={styles.icon} />
            </div>
            <div className={styles.statContent}>
              <AnimatedCounter target={stat.target} suffix={stat.suffix} isFloat={stat.isFloat} />
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statSub}>{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
