import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './DevExperience.module.css';

const STATS = [
  { label: 'Workspaces Created', target: 145000, suffix: '+' },
  { label: 'Collaborators', target: 450000, suffix: '+' },
  { label: 'Docker Containers', target: 2000000, suffix: '+' },
  { label: 'Latency', target: 12, suffix: 'ms' }
];

const AnimatedCounter = ({ target, suffix }) => {
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
        
        // Easing function (easeOutQuart)
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOut * target);
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    }
  }, [isInView, target]);

  return (
    <div ref={ref} className={styles.statValue}>
      {count.toLocaleString()}{suffix}
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
            <AnimatedCounter target={stat.target} suffix={stat.suffix} />
            <div className={styles.statLabel}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
