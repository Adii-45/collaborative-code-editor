import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './FinalCTA.module.css';

export default function FinalCTA() {
  return (
    <section className={styles.section}>
      <div className={styles.glow} />
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className={styles.title}>Ready to build your next product?</h2>
        <p className={styles.subtitle}>Join thousands of developers building on NovusIDE today.</p>
        <Link to="/signup" className={styles.btn}>
          Start Coding
        </Link>
      </motion.div>
    </section>
  );
}
