import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
      borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: active ? 600 : 500,
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      background: active ? 'var(--bg-muted)' : 'transparent',
      marginBottom: '4px', transition: 'all 0.15s ease'
    }}
  >
    <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
    {label}
  </div>
);
