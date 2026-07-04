import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import { ChevronRight, Play, CheckCircle2 } from 'lucide-react';
import AnimatedIDE from './AnimatedIDE';
import { useStorySync } from './useStorySync';

const FeatureBadge = ({ text, delay }) => (
  <motion.div 
    className={styles.featureBadge}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <CheckCircle2 size={14} className={styles.checkIcon} />
    {text}
  </motion.div>
);

export default function Hero() {
  const { text, currentPhrase } = useStorySync();

  return (
    <section className={styles.heroWrapper}>
      <div className={styles.backgroundEffects}>
        <div className={styles.gridOverlay}></div>
        <div className={styles.auroraGradient}></div>
        {/* Floating particles */}
        <div className={styles.particle} style={{ top: '20%', left: '15%' }}></div>
        <div className={styles.particle} style={{ top: '60%', right: '20%' }}></div>
        <div className={styles.particle} style={{ top: '80%', left: '30%' }}></div>
      </div>

      <div className={styles.contentContainer}>
        {/* Centered Copy & CTA */}
        <div className={styles.textContent}>
          <motion.h1 
            className={styles.headline}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            The Collaborative Cloud IDE
          </motion.h1>

          <div className={styles.typewriterContainer}>
            <h2 className={styles.typewriterText}>
              <span className={styles.gradientText}>{text}</span>
              <span className={styles.blinkingCursor}>|</span>
            </h2>
          </div>

          <motion.p 
            className={styles.description}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Code together in real time, import any GitHub repository, and run and preview
            your app — all in the browser. No setup, no installs, just a URL.
          </motion.p>

          <motion.div 
            className={styles.ctaGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link to="/signup" className={styles.primaryBtn}>
              Start Building
              <ChevronRight size={18} />
            </Link>
          </motion.div>

          <div className={styles.featureBadges}>
            <FeatureBadge text="GitHub Integration" delay={0.4} />
            <FeatureBadge text="Real-Time Collaboration" delay={0.5} />
            <FeatureBadge text="Instant Preview" delay={0.6} />
            <FeatureBadge text="One-Click Run" delay={0.7} />
          </div>
        </div>

        {/* Massive Centered IDE Mockup */}
        <motion.div 
          className={styles.ideShowcase}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        >
          <AnimatedIDE currentPhrase={currentPhrase} />
        </motion.div>
      </div>
    </section>
  );
}
