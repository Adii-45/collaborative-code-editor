import React from 'react';
import { motion } from 'framer-motion';
import styles from './Community.module.css';
import { Github, MessageSquare, Star, GitMerge, LayoutTemplate, ArrowRight } from 'lucide-react';

export default function Community() {
  return (
    <section className={styles.section}>
      <div className={styles.glowTop} />
      <div className={styles.header}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.title}
        >
          Built for the <span className={styles.gradientText}>Community</span>
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
      </div>

      <div className={styles.grid}>
        {/* GitHub Card */}
        <motion.div 
          className={`${styles.card} ${styles.githubCard}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.iconTitle}>
              <Github size={20} />
              <h3>Open Source</h3>
            </div>
            <div className={styles.statsBadge}>
              <Star size={14} /> 12.5k
            </div>
          </div>
          <p className={styles.cardDesc}>Contribute to the core engine and help shape the future of NovusIDE.</p>
          
          <div className={styles.gitActivity}>
            <div className={styles.gitItem}>
              <div className={styles.avatar} style={{background: '#3b82f6'}}>S</div>
              <div className={styles.gitText}>
                <span className={styles.gitUser}>sarah_dev</span> pushed to <span className={styles.gitBranch}>main</span>
                <div className={styles.gitCommit}>feat: improved language server</div>
              </div>
            </div>
            <div className={styles.gitItem}>
              <div className={styles.avatar} style={{background: '#10b981'}}>A</div>
              <div className={styles.gitText}>
                <span className={styles.gitUser}>alex_codes</span> merged PR #402
                <div className={styles.gitCommit}>fix: docker runtime latency</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Discord Card */}
        <motion.div 
          className={`${styles.card} ${styles.discordCard}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.iconTitle} style={{color: '#8b5cf6'}}>
              <MessageSquare size={20} />
              <h3>Discord</h3>
            </div>
            <div className={styles.onlineBadge}>
              <div className={styles.onlineDot} /> 2,401 online
            </div>
          </div>
          <p className={styles.cardDesc}>Chat with developers, get help, and showcase your projects.</p>
          
          <div className={styles.discordMessages}>
            <div className={styles.msgBubble}>How do I connect my custom domain? 🚀</div>
            <div className={styles.msgBubble} style={{alignSelf: 'flex-end', background: 'rgba(139, 92, 246, 0.2)'}}>Check the docs under Settings > Domains!</div>
            <div className={styles.msgBubble}>Thanks! Working perfectly now.</div>
          </div>
        </motion.div>

        {/* Templates Card */}
        <motion.div 
          className={`${styles.card} ${styles.templatesCard}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.iconTitle} style={{color: '#06b6d4'}}>
              <LayoutTemplate size={20} />
              <h3>Templates</h3>
            </div>
          </div>
          <p className={styles.cardDesc}>Jumpstart your next project with community-built starter templates.</p>
          
          <div className={styles.templateList}>
            <div className={styles.templateItem}>
              <div className={styles.tIcon} style={{color: '#61dafb'}}>⚛️</div>
              <div>
                <div className={styles.tName}>Next.js Boilerplate</div>
                <div className={styles.tUses}>12k uses</div>
              </div>
            </div>
            <div className={styles.templateItem}>
              <div className={styles.tIcon} style={{color: '#42b883'}}>💚</div>
              <div>
                <div className={styles.tName}>Vue 3 + Vite</div>
                <div className={styles.tUses}>8.5k uses</div>
              </div>
            </div>
          </div>
          
          <button className={styles.communityBtn}>
            Explore Templates <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
