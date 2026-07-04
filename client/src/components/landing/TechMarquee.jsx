import React from 'react';
import styles from './TechMarquee.module.css';

const TECH_ROW_1 = [
  'React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Monaco', 'Vite', 'Tailwind CSS'
];

const TECH_ROW_2 = [
  'JavaScript', 'TypeScript', 'xterm.js', 'Git', 'JWT', 'Vite', 'Framer Motion'
];

export default function TechMarquee() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Built with Open, Modern Technology</h2>
      </div>

      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeRow}>
          <div className={`${styles.marqueeTrack} ${styles.trackLeft}`}>
            {/* Double the array for seamless looping */}
            {[...TECH_ROW_1, ...TECH_ROW_1, ...TECH_ROW_1].map((tech, i) => (
              <div key={i} className={styles.techPill}>{tech}</div>
            ))}
          </div>
        </div>

        <div className={styles.marqueeRow}>
          <div className={`${styles.marqueeTrack} ${styles.trackRight}`}>
            {[...TECH_ROW_2, ...TECH_ROW_2, ...TECH_ROW_2].map((tech, i) => (
              <div key={i} className={styles.techPill}>{tech}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
