import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import BentoGrid from '../components/landing/BentoGrid';
import HowItWorks from '../components/landing/HowItWorks';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import DevExperience from '../components/landing/DevExperience';
import TechMarquee from '../components/landing/TechMarquee';
import Community from '../components/landing/Community';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
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
        <TechMarquee />
        <BentoGrid />
        <HowItWorks />
        <FeatureShowcase />
        <DevExperience />
        <Community />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
