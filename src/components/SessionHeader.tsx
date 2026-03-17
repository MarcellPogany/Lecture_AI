import React, { RefObject } from 'react';
import { format } from 'date-fns';
import { FileAudio } from 'lucide-react';
import { Session } from '../types';

interface SessionHeaderProps {
  session: Session;
  audioRef: RefObject<HTMLAudioElement | null>;
  onTitleChange: (title: string) => void;
  onTagChange: (tag: string) => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({ session, audioRef, onTitleChange, onTagChange }) => (
  <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
      {format(new Date(session.date), 'MMMM d, yyyy')} · {session.courseTag}
    </div>
    <input
      type="text"
      value={session.title}
      onChange={e => onTitleChange(e.target.value)}
      style={{ fontSize: '32px', fontWeight: 800, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', letterSpacing: '-0.8px', lineHeight: '1.2', width: '100%', padding: 0 }}
    />
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="text"
          value={session.courseTag}
          onChange={e => onTagChange(e.target.value)}
          placeholder="Course tag"
          style={{ fontSize: '13px', fontWeight: 500, background: 'var(--bg-muted)', border: 'none', outline: 'none', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px' }}
        />
      </div>
      {session.audioUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', background: 'var(--bg-surface)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <FileAudio size={16} color="var(--text-secondary)" />
          <audio ref={audioRef} src={session.audioUrl} controls style={{ height: '32px', width: '220px' }} />
        </div>
      )}
    </div>
  </div>
);
