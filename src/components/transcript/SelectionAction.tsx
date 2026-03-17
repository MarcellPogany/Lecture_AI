import React from 'react';
import { Play } from 'lucide-react';

interface SelectionActionProps {
  selectedText: string;
  isSelectedGeneratingTTS: boolean;
  onGenerateSelectionTTS: () => void;
}

export const SelectionAction: React.FC<SelectionActionProps> = ({ selectedText, isSelectedGeneratingTTS, onGenerateSelectionTTS }) => {
  if (!selectedText.trim()) return null;

  return (
    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }}>
      <div style={{ overflow: 'hidden', marginRight: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Selected</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{selectedText}"</div>
      </div>
      <button
        onClick={onGenerateSelectionTTS}
        disabled={isSelectedGeneratingTTS}
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', border: 'none', background: 'var(--accent)', color: 'white' }}
      >
        <Play size={12} />
        Play
      </button>
    </div>
  );
};
