import React from 'react';
import { motion } from 'framer-motion';
import styles from './Pricing.module.css';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Hobby',
    price: 'Free',
    desc: 'Perfect for side projects and learning.',
    features: ['Up to 3 projects', 'Basic collaboration', 'Community support', 'Standard runtime'],
    btnText: 'Start for free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/mo',
    desc: 'For professional developers and small teams.',
    features: ['Unlimited projects', 'Advanced collaboration', 'Priority support', 'Faster runtimes', 'Custom domains'],
    btnText: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For large organizations needing control.',
    features: ['SSO & SAML', 'Dedicated infrastructure', '24/7 SLA', 'Custom runtimes', 'Audit logs'],
    btnText: 'Contact Sales',
    popular: false
  }
];

export default function Pricing() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.title}
        >
          Simple, transparent pricing
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          Start for free, upgrade when you need to.
        </motion.p>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan, i) => (
          <motion.div 
            key={i}
            className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
            <div className={styles.cardHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.priceContainer}>
                <span className={styles.price}>{plan.price}</span>
                {plan.period && <span className={styles.period}>{plan.period}</span>}
              </div>
              <p className={styles.planDesc}>{plan.desc}</p>
            </div>
            
            <button className={plan.popular ? styles.primaryBtn : styles.secondaryBtn}>
              {plan.btnText}
            </button>

            <ul className={styles.featuresList}>
              {plan.features.map((feat, j) => (
                <li key={j} className={styles.featureItem}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
