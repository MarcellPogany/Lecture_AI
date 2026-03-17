import React from 'react';
import { Sparkles } from 'lucide-react';
import { Session } from '../types';

interface NavbarProps {
  activeSession: Session | null;
}

export function Navbar({ activeSession }: NavbarProps) {
  return (
    <header style={{ height: '64px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
        <span>LectureAI</span>
        {activeSession && (
          <>
            <span style={{ color: 'var(--border)' }}>/</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSession.title}
            </span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
          Transcript
        </button>
        <button style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(30,41,59,0.1)' }}>
          <Sparkles size={14} />
          Summary
        </button>
      </div>
    </header>
  );
}
