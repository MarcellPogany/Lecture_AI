import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

export const UserFooter: React.FC = () => {
  const { user, profile, signOut } = useAuthContext();
  const initial = (profile?.display_name || user?.email || 'U')[0].toUpperCase();

  return (
    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile?.display_name || 'Marcell Pogany'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email || 'marcell.pogany@stu...'}
        </div>
      </div>
      <button 
        onClick={signOut} 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'transparent', border: '1px solid var(--border)', 
          color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', 
          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
          transition: 'all 0.2s ease', 
          width: '100%' 
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
};
