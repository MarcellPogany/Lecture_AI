import React from 'react';
import { FileText, Tag, Layers, BookMarked, HelpCircle } from 'lucide-react';

interface SummaryTabsProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

const tabs = [
  { id: 'tldr',      label: 'TL;DR',      icon: <FileText size={13} /> },
  { id: 'concepts',  label: 'Key Concepts', icon: <Tag size={13} /> },
  { id: 'detailed',  label: 'Detailed',    icon: <Layers size={13} /> },
  { id: 'glossary',  label: 'Glossary',    icon: <BookMarked size={13} /> },
  { id: 'questions', label: 'Study Guide', icon: <HelpCircle size={13} /> },
];

export const SummaryTabs: React.FC<SummaryTabsProps> = ({ activeTab, onTabChange }) => (
  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 4px' }}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id as any)}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          padding: '14px 8px', fontSize: '12px', fontWeight: activeTab === tab.id ? 700 : 500,
          border: 'none', cursor: 'pointer', background: 'transparent', transition: 'all 0.2s',
          color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
          borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
          marginBottom: '-1px'
        }}
      >
        {tab.icon}
        <span style={{ fontSize: '11px' }}>{tab.label}</span>
      </button>
    ))}
  </div>
);
