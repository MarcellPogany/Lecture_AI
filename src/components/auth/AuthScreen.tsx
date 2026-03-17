import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { AuthField } from './AuthField';
import { AuthFooter } from './AuthFooter';

type Mode = 'signin' | 'signup' | 'forgot';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuthContext();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    if (mode === 'signup') {
      const { error, data } = await signUp(email, password, displayName);
      if (error) setMessage({ type: 'error', text: error });
      else if (!data?.session) { setMessage({ type: 'success', text: 'Account created! Please sign in.' }); setMode('signin'); }
    } else if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setMessage({ type: 'error', text: error });
    } else {
      const { error } = await resetPassword(email);
      if (error) setMessage({ type: 'error', text: error });
      else setMessage({ type: 'success', text: 'Password reset email sent — check your inbox.' });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(30,41,59,0.15)' }}>
            <BookOpen size={30} color="white" />
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>LectureAI</h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {mode === 'signin' ? 'Welcome back.' : mode === 'signup' ? 'Create your professional account.' : 'Reset your password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          {mode === 'signup' && <AuthField label="Display Name" icon={<User size={16} />} value={displayName} onChange={setDisplayName} />}
          <AuthField label="Email Address" icon={<Mail size={16} />} value={email} onChange={setEmail} type="email" />
          {mode !== 'forgot' && <AuthField label="Password" icon={<Lock size={16} />} value={password} onChange={setPassword} type="password" />}

          {message && (
            <div style={{ padding: '14px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', border: `1px solid ${message.type === 'error' ? '#fee2e2' : '#dcfce7'}` }}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', border: 'none', background: 'var(--accent)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(30,41,59,0.15)' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
          <AuthFooter mode={mode} setMode={setMode} setMessage={setMessage} />
        </form>
      </div>
    </div>
  );
};
