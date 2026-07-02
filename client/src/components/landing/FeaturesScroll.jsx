import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './FeaturesScroll.module.css';
import { Users, Github, Zap, MonitorPlay, UserPlus, GitCommit, Rocket, Clock } from 'lucide-react';

const FeatureCard = ({ title, description, icon: Icon, delay, index, children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay: delay || 0, ease: "easeOut" }}
      className={`${styles.featureCard} ${index === 0 || index === 7 ? styles.wideCard : ''}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <Icon size={24} />
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={styles.cardVisual}>
        {children}
      </div>
    </motion.div>
  );
};

// Sub-components for visuals
const SlowDevVisual = () => (
  <div className={styles.slowDevContainer}>
    <div className={styles.step}>Setup Local Env <Clock size={14}/></div>
    <div className={styles.arrow}>↓</div>
    <div className={styles.step}>Install Dependencies <Clock size={14}/></div>
    <div className={styles.arrow}>↓</div>
    <div className={styles.step}>Resolve Conflicts <Clock size={14}/></div>
    <div className={styles.cross}>✗</div>
  </div>
);

const CollabVisual = () => (
  <div className={styles.collabContainer}>
    <motion.div className={styles.collabCursor1} animate={{ x: [0, 50, 20], y: [0, 20, 50] }} transition={{ repeat: Infinity, duration: 3 }}><div className={styles.cursorPoint} style={{backgroundColor: '#3b82f6'}}></div>Sarah</motion.div>
    <motion.div className={styles.collabCursor2} animate={{ x: [50, 0, 40], y: [20, 50, 10] }} transition={{ repeat: Infinity, duration: 4 }}><div className={styles.cursorPoint} style={{backgroundColor: '#06b6d4'}}></div>Alex</motion.div>
  </div>
);

const GithubVisual = () => (
  <div className={styles.githubContainer}>
    <motion.div className={styles.repoBox} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>user/react-app</motion.div>
    <motion.div className={styles.progressLine} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ repeat: Infinity, duration: 2 }}></motion.div>
    <div className={styles.nexusBox}>NexusIDE</div>
  </div>
);

const RunVisual = () => (
  <div className={styles.terminalContainer}>
    <div className={styles.terminalHeader}>
      <span className={styles.dot} style={{backgroundColor:'#ff5f56'}}></span>
      <span className={styles.dot} style={{backgroundColor:'#ffbd2e'}}></span>
      <span className={styles.dot} style={{backgroundColor:'#27c93f'}}></span>
    </div>
    <div className={styles.terminalBody}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}>$ npm run start</motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.1, repeat: Infinity, repeatDelay: 2.5 }} style={{color: '#27c93f'}}>Starting development server...</motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.1, repeat: Infinity, repeatDelay: 2 }} style={{color: '#a5d6ff'}}>Compiled successfully!</motion.div>
    </div>
  </div>
);

export default function FeaturesScroll() {
  const features = [
    {
      title: "Why traditional development is slow",
      description: "Hours wasted on 'works on my machine', dependency hell, and broken local environments.",
      icon: Clock,
      visual: <SlowDevVisual />
    },
    {
      title: "Real-time collaboration",
      description: "Code together just like Google Docs. See every keystroke and cursor instantly.",
      icon: Users,
      visual: <CollabVisual />
    },
    {
      title: "Import any GitHub repository",
      description: "Paste a URL and start coding. No cloning, no setup required.",
      icon: Github,
      visual: <GithubVisual />
    },
    {
      title: "Run instantly in the cloud",
      description: "Dedicated isolated containers boot your project in milliseconds.",
      icon: Zap,
      visual: <RunVisual />
    },
    {
      title: "Live preview",
      description: "See your changes instantly with Hot Module Replacement.",
      icon: MonitorPlay,
      visual: <div className={styles.previewVisual}>localhost:3000 <span className={styles.blinkingDot}></span></div>
    },
    {
      title: "Invite collaborators",
      description: "Send a secure link and pair program with anyone, anywhere.",
      icon: UserPlus,
      visual: <div className={styles.inviteBtn}>Copy Invite Link</div>
    },
    {
      title: "Commit & Push",
      description: "Built-in Git integration. Commit and push directly to your repo.",
      icon: GitCommit,
      visual: <div className={styles.gitVisual}>Added landing page<br/><span style={{color: '#8b949e'}}>3 files changed</span></div>
    },
    {
      title: "Deploy faster",
      description: "Ship your ideas at lightspeed. From blank canvas to production.",
      icon: Rocket,
      visual: <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2 }}><Rocket size={48} color="#3b82f6" /></motion.div>
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>The new standard for <span className={styles.gradientText}>collaboration</span></h2>
        <p className={styles.sectionSubtitle}>Everything you need to build software, entirely in your browser.</p>
      </div>

      <div className={styles.featuresGrid}>
        {features.map((feature, idx) => (
          <FeatureCard 
            key={idx}
            index={idx}
            title={feature.title} 
            description={feature.description} 
            icon={feature.icon}
            delay={idx % 2 === 0 ? 0.1 : 0.3}
          >
            {feature.visual}
          </FeatureCard>
        ))}
      </div>
    </section>
  );
}
