import React from 'react';

interface AuthFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}

export const AuthField: React.FC<AuthFieldProps> = ({ label, icon, value, onChange, type = 'text' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        style={{ width: '100%', padding: '12px 14px 12px 42px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease' }}
      />
    </div>
  </div>
);
