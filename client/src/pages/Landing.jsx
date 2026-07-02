import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import FeaturesScroll from '../components/landing/FeaturesScroll';
import IDEPreview from '../components/landing/IDEPreview';
import Footer from '../components/landing/Footer';
import styles from './Landing.module.css';

export default function Landing() {
  return (
    <div className={styles.landingContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>&lt;/&gt;</div>
          <span className={styles.logoText}>NexusIDE</span>
        </div>
        <nav className={styles.nav}>
          <Link to="/login" className={styles.loginBtn}>Sign In</Link>
          <Link to="/signup" className={styles.signupBtn}>Start Coding</Link>
        </nav>
      </header>

      <main className={styles.mainContent}>
        <Hero />
        <FeaturesScroll />
        <IDEPreview />
      </main>

      <Footer />
    </div>
  );
}
