import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import FeaturesScroll from '../components/landing/FeaturesScroll';
import IDEPreview from '../components/landing/IDEPreview';
import Footer from '../components/landing/Footer';
import styles from './Landing.module.css';
import { ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className={styles.landingContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.navLeft}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>&lt;/&gt;</div>
              <span>NovusIDE</span>
            </div>
          </div>
          
          <nav className={styles.navCenter}>
            <Link to="#features" className={styles.navLink}>Features</Link>
            <Link to="#pricing" className={styles.navLink}>Pricing</Link>
            <Link to="#docs" className={styles.navLink}>Docs</Link>
            <Link to="#about" className={styles.navLink}>About</Link>
          </nav>
          
          <div className={styles.navRight}>
            <Link to="/login" className={styles.loginBtn}>Sign In</Link>
            <Link to="/signup" className={styles.signupBtn}>
              Start Coding
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
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
