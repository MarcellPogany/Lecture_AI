import React, { RefObject } from 'react';
import { Play, Download } from 'lucide-react';
import { Session } from '../../types';

interface TtsPlayerBarProps {
  ttsAudioUrl: string;
  activeSession: Session;
  ttsAudioRef: RefObject<HTMLAudioElement | null>;
}

export const TtsPlayerBar: React.FC<TtsPlayerBarProps> = ({ ttsAudioUrl, activeSession, ttsAudioRef }) => (
  <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Play size={13} color="var(--accent-hover)" />
    </div>
    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Audio Summary</span>
    <audio ref={ttsAudioRef} src={ttsAudioUrl} controls autoPlay style={{ height: '28px', flex: 1 }} />
    <a href={ttsAudioUrl} download={`${activeSession.title}-summary.mp3`}
      style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: '6px', display: 'flex', transition: 'color 0.15s' }}>
      <Download size={16} />
    </a>
  </div>
);
