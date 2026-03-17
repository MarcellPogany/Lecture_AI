import React from 'react';

interface AuthFooterProps {
  mode: 'signin' | 'signup' | 'forgot';
  setMode: (mode: 'signin' | 'signup' | 'forgot') => void;
  setMessage: (msg: any) => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ mode, setMode, setMessage }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
    {mode === 'signin' && (
      <>
        <button type="button" onClick={() => { setMode('forgot'); setMessage(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}>
          Forgot your password?
        </button>
        <div style={{ height: '1px', width: '40px', background: 'var(--border)' }} />
        <button type="button" onClick={() => { setMode('signup'); setMessage(null); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          Don't have an account? Sign Up
        </button>
      </>
    )}
    {mode !== 'signin' && (
      <button type="button" onClick={() => { setMode('signin'); setMessage(null); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
        ← Back to Sign In
      </button>
    )}
  </div>
);
