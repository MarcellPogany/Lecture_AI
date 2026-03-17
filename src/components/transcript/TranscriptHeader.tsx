import React from 'react';
import { AlignLeft, Loader2, BookOpen } from 'lucide-react';
import { Session } from '../../types';

interface TranscriptHeaderProps {
  activeSession: Session;
  isSummarizing: boolean;
  onSummarize: () => void;
  wordCount: number;
}

export const TranscriptHeader: React.FC<TranscriptHeaderProps> = ({ activeSession, isSummarizing, onSummarize, wordCount }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {wordCount > 0 && (
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '4px 12px', borderRadius: '6px' }}>
          {wordCount.toLocaleString()} words
        </span>
      )}
    </div>
    <button
      onClick={onSummarize}
      disabled={isSummarizing || !activeSession.transcript}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
        borderRadius: '10px', cursor: isSummarizing || !activeSession.transcript ? 'not-allowed' : 'pointer',
        fontWeight: 700, fontSize: '13px', border: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isSummarizing || !activeSession.transcript ? 'var(--bg-muted)' : 'var(--accent)',
        color: isSummarizing || !activeSession.transcript ? 'var(--text-muted)' : 'white',
        boxShadow: isSummarizing || !activeSession.transcript ? 'none' : '0 4px 12px rgba(30,41,59,0.1)'
      }}
    >
      {isSummarizing ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
      {isSummarizing ? 'Generating...' : 'Generate AI Summary'}
    </button>
  </div>
);
