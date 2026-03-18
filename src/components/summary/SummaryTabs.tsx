import React from 'react';
import { Layers, CreditCard, HelpCircle, Mic2, Network, Table2, LayoutTemplate } from 'lucide-react';

interface SummaryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'detailed',   label: 'Summary',      icon: <Layers size={13} /> },
  { id: 'flashcards', label: 'Flashcards',   icon: <CreditCard size={13} /> },
  { id: 'quiz',       label: 'Quiz',         icon: <HelpCircle size={13} /> },
  { id: 'podcast',    label: 'Podcast',      icon: <Mic2 size={13} /> },
  { id: 'mindmap',    label: 'Mind Map',     icon: <Network size={13} /> },
  { id: 'datatable',  label: 'Data',         icon: <Table2 size={13} /> },
  { id: 'slides',     label: 'Slides',       icon: <LayoutTemplate size={13} /> },
];

export const SummaryTabs: React.FC<SummaryTabsProps> = ({ activeTab, onTabChange }) => (
  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', gap: '2px', background: 'var(--bg-surface)', overflowX: 'auto', flexShrink: 0 }}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '13px 14px', fontSize: '12px',
          fontWeight: activeTab === tab.id ? 700 : 500,
          border: 'none', cursor: 'pointer', background: 'transparent',
          transition: 'all 0.2s',
          color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
          borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
          marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);
