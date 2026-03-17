import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Session } from '../../types';

interface TabContentProps {
  activeTab: string;
  activeSession: Session;
  isGeneratingTTS: boolean;
  onGenerateTTS: (text: string) => void;
}

export const TabContent: React.FC<TabContentProps> = ({ activeTab, activeSession, isGeneratingTTS, onGenerateTTS }) => {
  const summary = activeSession.summary;
  if (!summary) return null;

  switch (activeTab) {
    case 'tldr':
      return (
        <div>
          <div 
            style={{ fontSize: '15px', lineHeight: '1.75', color: 'var(--text-primary)', margin: '0 0 24px' }}
            dangerouslySetInnerHTML={{ __html: summary.tldr }}
          />
          <button
            onClick={() => onGenerateTTS(summary.tldr.replace(/<[^>]*>?/gm, ''))}
            disabled={isGeneratingTTS}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
          >
            {isGeneratingTTS ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            {isGeneratingTTS ? 'Playing...' : 'Listen to TL;DR'}
          </button>
        </div>
      );
    case 'concepts':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {summary.keyConcepts.map((concept, i) => (
            <div key={i} className="glass-card" style={{ padding: '14px 16px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-hover)' }}>{i + 1}</span>
              </div>
              <div 
                style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}
                dangerouslySetInnerHTML={{ __html: concept }}
              />
            </div>
          ))}
        </div>
      );
    case 'detailed': {
      const fullDetailedText = summary.detailedSummary.map(s => `${s.topic}.\n\n${s.content}`).join('\n\n');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
            <button
              onClick={() => onGenerateTTS(fullDetailedText.replace(/<[^>]*>?/gm, ''))}
              disabled={isGeneratingTTS}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
              title="Listen to the full detailed summary"
            >
              {isGeneratingTTS ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {isGeneratingTTS ? 'Playing...' : 'Listen to Full Chapter'}
            </button>
          </div>
          {summary.detailedSummary.map((section, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '20px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{section.topic}</h3>
              </div>
              <div 
                style={{ margin: 0, fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)', paddingLeft: '32px', whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>
      );
    }
    case 'glossary':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {summary.glossary.map((item, i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-muted)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: item.term }} />
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: item.definition }} />
            </div>
          ))}
        </div>
      );
    case 'questions':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {summary.studyQuestions.map((q, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 16px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', minWidth: '20px', paddingTop: '1px' }}>{i + 1}.</span>
              <div style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: q }} />
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}
