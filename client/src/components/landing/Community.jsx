import React from 'react';
import { motion } from 'framer-motion';
import styles from './Community.module.css';
import { Github, MessageSquare, LayoutTemplate, Heart } from 'lucide-react';

const ITEMS = [
  { icon: Github, title: 'Open Source', desc: 'Contribute to the core engine.' },
  { icon: MessageSquare, title: 'Discord Community', desc: 'Chat with 10k+ developers.' },
  { icon: LayoutTemplate, title: 'Templates', desc: 'Share and remix starter kits.' },
  { icon: Heart, title: 'Hackathons', desc: 'Sponsoring weekend builders.' }
];

export default function Community() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.title}
          >
            Built for the <br/><span className={styles.gradientText}>Community</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={styles.subtitle}
          >
            Join thousands of developers building the future of software development together.
          </motion.p>
          
          <div className={styles.grid}>
            {ITEMS.map((item, i) => (
              <motion.div 
                key={i} 
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (i * 0.1) }}
              >
                <div className={styles.iconWrapper}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className={styles.cardTitle}>{item.title}</h4>
                  <p className={styles.cardDesc}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.globeGlow} />
          {/* Decorative elements representing community */}
          <div className={styles.floatingAvatars}>
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i} 
                className={styles.avatar} 
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`
                }}
                animate={{
                  y: [0, -15, 0],
                  x: [0, Math.random() * 10 - 5, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
