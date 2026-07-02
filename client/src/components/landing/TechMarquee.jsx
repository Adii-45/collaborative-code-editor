import React from 'react';
import styles from './TechMarquee.module.css';

const TECH_ROW_1 = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Socket.IO'
];

const TECH_ROW_2 = [
  'Yjs', 'Docker', 'Redis', 'Python', 'FastAPI', 'Go', 'Rust', 'Java', 'TailwindCSS', 'Liveblocks'
];

export default function TechMarquee() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Powered by Modern Technology</h2>
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
