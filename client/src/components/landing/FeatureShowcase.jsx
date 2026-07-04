import React from 'react';
import { motion } from 'framer-motion';
import styles from './FeatureShowcase.module.css';
import mock from './BentoGrid.module.css';
import {
  Check, ChevronRight, ChevronDown, FileCode, Folder, MessageSquare,
  Box, Database, Server
} from 'lucide-react';

const SHOWCASES = [
  {
    title: 'Multiplayer Editing',
    description: 'Code with your team in real time. See exactly who is typing where, follow live cursors, and brainstorm solutions inside the same file.',
    features: ['Real-time sync over WebSockets', 'Live cursors and presence', 'See who is editing, as it happens'],
    badge: 'Live',
    badgeColor: '#10b981', // green
    reversed: false,
    visual: 'editor'
  },
  {
    title: 'Isolated Workspaces',
    description: 'No more "it works on my machine". Every project runs in its own isolated workspace, with dedicated Docker containers on the roadmap for stronger sandboxing.',
    features: ['Isolated per-project workspace', 'Your own terminal, per project', 'Docker container support (roadmap)'],
    badge: 'Secure',
    badgeColor: '#8b5cf6', // purple
    reversed: true,
    visual: 'containers'
  }
];

/* Shared window chrome — identical tokens to the BentoGrid mockups */
const WindowChrome = ({ children, tabs, title }) => (
  <div className={`${mock.mockWindow} ${styles.showcaseWindow}`}>
    <div className={mock.mockHeader}>
      <div className={mock.macLights}>
        <div className={mock.lightRed} />
        <div className={mock.lightYellow} />
        <div className={mock.lightGreen} />
      </div>
      {tabs ? (
        <div className={mock.mockTabs}>
          {tabs.map((t, i) => (
            <div key={i} className={i === 0 ? mock.mockTabActive : mock.mockTab}>{t.icon} {t.name}</div>
          ))}
        </div>
      ) : (
        <div className={mock.mockTitle}>{title}</div>
      )}
    </div>
    {children}
  </div>
);

const EditorMock = () => (
  <WindowChrome
    tabs={[
      { name: 'App.tsx', icon: <FileCode size={12} color="#4fc1ff" /> },
      { name: 'styles.css', icon: <FileCode size={12} color="#eab308" /> }
    ]}
  >
    <div className={mock.mockBodyRow}>
      <div className={mock.mockSidebar}>
        <div className={mock.sidebarSection}>EXPLORER</div>
        <div className={mock.sidebarItem}><ChevronDown size={12} /> <Folder size={12} color="#3b82f6" /> src</div>
        <div className={mock.sidebarItemActive} style={{ paddingLeft: '24px' }}><FileCode size={12} color="#4fc1ff" /> App.tsx</div>
        <div className={mock.sidebarItem} style={{ paddingLeft: '24px' }}><FileCode size={12} color="#eab308" /> styles.css</div>
      </div>
      <div className={mock.mockCodeArea} style={{ padding: '16px 20px' }}>
        <div className={mock.mockAvatars}>
          <div className={mock.avatar} style={{ background: '#3b82f6', zIndex: 3 }}>S</div>
          <div className={mock.avatar} style={{ background: '#d946ef', zIndex: 2, marginLeft: '-8px' }}>A</div>
        </div>
        <div className={mock.codeLine}><span className={mock.kw}>import</span> {'{'} useRoom {'}'} <span className={mock.kw}>from</span> <span className={mock.str}>'./realtime'</span>;</div>
        <div className={mock.codeLine}>&nbsp;</div>
        <div className={mock.codeLine}><span className={mock.kw}>export default function</span> <span className={mock.fn}>App</span>() {'{'}</div>
        <div className={mock.codeLineActive}>  <span className={mock.kw}>const</span> room = <span className={mock.fn}>useRoom</span>();</div>
        <div className={mock.codeLine}>  <span className={mock.kw}>return</span> &lt;<span className={mock.html}>Editor</span> <span className={mock.attr}>room</span>={'{'}room{'}'} /&gt;;</div>
        <div className={mock.codeLine}>{'}'}</div>

        <div className={mock.activeLineHighlight} style={{ top: '76px' }} />

        <div className={mock.inlineComment} style={{ top: '92px', left: '150px' }}>
          <div className={mock.commentHeader}><MessageSquare size={10} /> Sarah</div>
          <div className={mock.commentBody}>Sync looks great here!</div>
        </div>

        <div className={mock.cursorTyping} style={{ top: '76px', left: '140px' }}>
          <div className={mock.caret} style={{ background: '#3b82f6' }} />
          <div className={mock.cursorLabel} style={{ background: '#3b82f6' }}>Sarah</div>
        </div>
        <div className={mock.cursorFloating} style={{ top: '30px', left: '230px', animationDelay: '1s' }}>
          <div className={mock.caret} style={{ background: '#d946ef' }} />
          <div className={mock.cursorLabel} style={{ background: '#d946ef' }}>Alex</div>
        </div>
      </div>
    </div>
  </WindowChrome>
);

const ContainerMock = () => (
  <WindowChrome title="Infrastructure Dashboard">
    <div className={mock.mockCodeArea} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className={mock.tableHeader}>
        <span>SERVICE</span><span>STATUS</span><span>CPU</span><span>RAM</span>
      </div>
      <div className={mock.tableRow}>
        <span className={mock.tableName}><Box size={12} /> workspace</span>
        <span className={mock.tableStatus}><div className={mock.statusDot} /> Running</span>
        <span className={mock.tableMetricPulse}>1.2%</span>
        <span className={mock.tableMetric}>245MB</span>
      </div>
      <div className={mock.tableRow}>
        <span className={mock.tableName}><Database size={12} /> postgres</span>
        <span className={mock.tableStatus}><div className={mock.statusDot} /> Running</span>
        <span className={mock.tableMetricPulse} style={{ animationDelay: '0.5s' }}>0.1%</span>
        <span className={mock.tableMetric}>48MB</span>
      </div>
      <div className={mock.tableRow}>
        <span className={mock.tableName}><Server size={12} /> redis</span>
        <span className={mock.tableStatusBuild}><div className={mock.spinner} /> Building</span>
        <span className={mock.tableMetric}>-</span>
        <span className={mock.tableMetric}>-</span>
      </div>
    </div>
  </WindowChrome>
);

const VISUALS = {
  editor: EditorMock,
  containers: ContainerMock
};

export default function FeatureShowcase() {
  return (
    <section className={styles.section}>
      {SHOWCASES.map((showcase, index) => {
        const Visual = VISUALS[showcase.visual];
        return (
          <div key={index} className={`${styles.row} ${showcase.reversed ? styles.reversed : ''}`}>
            <motion.div
              className={styles.textContent}
              initial={{ opacity: 0, x: showcase.reversed ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h3 className={styles.title}>{showcase.title}</h3>
              <p className={styles.description}>{showcase.description}</p>

              <ul className={styles.featureList}>
                {showcase.features.map((feat, i) => (
                  <li key={i} className={styles.featureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    {feat}
                  </li>
                ))}
              </ul>

              <button className={styles.ctaBtn}>
                Learn more <ChevronRight size={14} />
              </button>
            </motion.div>

            <motion.div
              className={styles.visualContent}
              initial={{ opacity: 0, x: showcase.reversed ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Visual />
              {/* Glowing backdrop — same accent treatment as the bento cards */}
              <div className={styles.glow} style={{ background: `radial-gradient(circle, ${showcase.badgeColor}33 0%, transparent 70%)` }} />
            </motion.div>
          </div>
        );
      })}
    </section>
  );
}
