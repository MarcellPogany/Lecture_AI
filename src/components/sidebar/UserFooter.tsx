import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

export const UserFooter: React.FC = () => {
  const { user, profile, signOut } = useAuthContext();
  const initial = (profile?.display_name || user?.email || 'U')[0].toUpperCase();

  return (
    <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: 'white', flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile?.display_name || 'User'}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
      </div>
      <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', flexShrink: 0 }}>
        <LogOut size={15} />
      </button>
    </div>
  );
};
