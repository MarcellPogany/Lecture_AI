import React from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Session } from '../../types';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  tagStyle: string;
}

export const SessionItem: React.FC<SessionItemProps> = ({ session, isActive, onSelect, onDelete, tagStyle }) => (
  <div
    onClick={onSelect}
    style={{
      padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px',
      background: isActive ? 'var(--bg-muted)' : 'transparent',
      border: isActive ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative'
    }}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-muted)'; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {session.title}
      </span>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0, opacity: 0.6 }}
      >
        <Trash2 size={12} />
      </button>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
      <span className={tagStyle} style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.04em' }}>
        {session.courseTag}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        {format(new Date(session.date), 'MMM d')}
      </span>
    </div>
  </div>
);
