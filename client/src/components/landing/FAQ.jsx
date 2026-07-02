import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FAQ.module.css';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the collaborative editing work?',
    a: 'NovusIDE uses Conflict-free Replicated Data Types (CRDTs) powered by Yjs and Liveblocks. This ensures that multiple developers can edit the same file simultaneously without merge conflicts, with sub-50ms latency globally.'
  },
  {
    q: 'Can I import private GitHub repositories?',
    a: 'Yes. By connecting your GitHub account, NovusIDE can instantly clone, install dependencies, and run both public and private repositories securely within isolated Docker containers.'
  },
  {
    q: 'How are my projects isolated?',
    a: 'Every workspace runs in its own dedicated Docker container. We use Firecracker microVMs to provide strong hardware-level isolation, ensuring your code and environment variables remain completely secure.'
  },
  {
    q: 'What languages and frameworks are supported?',
    a: 'We support all major languages including JavaScript, TypeScript, Python, Go, Rust, and Java. If it can run in a Docker container, it can run on NovusIDE.'
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
