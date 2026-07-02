import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>&lt;/&gt;</div>
            <span className={styles.logoText}>NexusIDE</span>
          </div>
          <p className={styles.tagline}>
            The blazing-fast collaborative cloud IDE for modern teams.
          </p>
        </div>
        
        <div className={styles.linksGrid}>
          <div className={styles.linkColumn}>
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/changelog">Changelog</Link>
          </div>
          <div className={styles.linkColumn}>
            <h4>Resources</h4>
            <Link to="/docs">Documentation</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/community">Community</Link>
          </div>
          <div className={styles.linkColumn}>
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} NexusIDE. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
