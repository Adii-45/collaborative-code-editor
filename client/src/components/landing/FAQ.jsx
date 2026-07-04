import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FAQ.module.css';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the collaborative editing work?',
    a: 'NovusIDE keeps your workspace in sync in real time over WebSockets (Socket.IO). Edits, cursor moves, and file changes are broadcast to everyone in the room as they happen, so you can see teammates’ live cursors and presence while you code together.'
  },
  {
    q: 'Can I import private GitHub repositories?',
    a: 'Yes. Connect your GitHub account and NovusIDE clones the repository with Git, installs its dependencies, and gets it running — for both public and private repos. Each project runs in its own isolated workspace.'
  },
  {
    q: 'How are my projects isolated?',
    a: 'Every project runs in its own isolated workspace with a scoped filesystem and sandboxed command execution. Dedicated Docker containers are on our near-term roadmap for even stronger isolation.'
  },
  {
    q: 'What languages and frameworks are supported?',
    a: 'NovusIDE runs JavaScript and TypeScript projects on Node.js today, with broader language support expanding over time. If it runs on Node, it runs on NovusIDE.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.title}
        >
          Frequently Asked Questions
        </motion.h2>
      </div>

      <div className={styles.accordion}>
        {FAQS.map((faq, i) => (
          <motion.div 
            key={i} 
            className={`${styles.item} ${openIndex === i ? styles.open : ''}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
          >
            <div className={styles.question}>
              <span>{faq.q}</span>
              <ChevronDown 
                size={20} 
                className={styles.icon} 
                style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </div>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={styles.answerWrapper}
                >
                  <div className={styles.answer}>
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
