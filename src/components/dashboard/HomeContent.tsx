import React from 'react';
import { Mic, Upload, Clock, FileText, ChevronRight, Play, Star, MoreVertical, Sparkles } from 'lucide-react';
import { Session } from '../../types';

interface HomeContentProps {
  sessions: Session[];
  onStartRecording: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSession: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  isUploading: boolean;
}

export const HomeContent: React.FC<HomeContentProps> = ({ 
  sessions, onStartRecording, onFileUpload, onSelectSession, onDeleteSession, isUploading 
}) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
  
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const totalHours = Math.round(sessions.length * 1.2); // Placeholder logic
  const totalConcepts = sessions.reduce((acc, s) => acc + (s.summary?.keyConcepts?.length || 0), 0);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-1px' }}>
          Good {greeting}, Student.
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <StatCard icon={<Clock size={20} />} label="Learning Hours" value={`${totalHours}h`} color="#6366f1" />
        <StatCard icon={<FileText size={20} />} label="Total Lectures" value={sessions.length.toString()} color="#ec4899" />
        <StatCard icon={<Star size={20} />} label="Key Concepts" value={totalConcepts.toString()} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Recent Activity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Sessions</h2>
            <button style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentSessions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No sessions yet. Start your first one below!</p>
              </div>
            ) : (
              recentSessions.map(session => (
                <SessionRowCard key={session.id} session={session} onClick={() => onSelectSession(session.id)} onDelete={onDeleteSession ? () => onDeleteSession(session.id) : undefined} />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ActionCard 
              icon={<Mic size={24} />} 
              title="Record Session" 
              desc="Start live transcription" 
              onClick={onStartRecording}
              primary
            />
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <ActionCard 
                icon={<Upload size={24} />} 
                title="Upload Audio" 
                desc="m4a, mp3, mp4 supported" 
                loading={isUploading}
                asLabel
              />
              <input type="file" accept="audio/*,.m4a" style={{ display: 'none' }} onChange={onFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
      {icon}
    </div>
    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
  </div>
);

export const SessionRowCard = ({ session, onClick, onDelete }: { session: Session, onClick: () => void, onDelete?: () => void, key?: string }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div 
      onClick={onClick}
      style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
        setShowMenu(false);
      }}
    >
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Play size={20} fill="currentColor" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px', marginBottom: '4px' }}>{session.title}</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>{session.courseTag}</span>
          {session.summary && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Sparkles size={10} /> AI Ready
            </span>
          )}
        </div>
      </div>
      
      {onDelete ? (
        <div style={{ position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
          >
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <div style={{ 
              position: 'absolute', right: 0, top: '100%', 
              background: 'white', border: '1px solid #E2E8F0', 
              borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              zIndex: 100, minWidth: '140px', overflow: 'hidden'
            }}>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowMenu(false);
                  if (window.confirm('Are you sure you want to delete this session?')) {
                    onDelete();
                  }
                }}
                style={{ 
                  width: '100%', padding: '10px 16px', background: 'none', 
                  border: 'none', color: '#EF4444', 
                  textAlign: 'left', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500
                }}
              >
                Delete Session
              </button>
            </div>
          )}
        </div>
      ) : (
        <ChevronRight size={18} color="var(--text-muted)" />
      )}
    </div>
  );
};

const ActionCard = ({ icon, title, desc, onClick, primary, loading, asLabel }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void, primary?: boolean, loading?: boolean, asLabel?: boolean }) => (
  <div 
    onClick={onClick}
    style={{ 
      background: primary ? 'var(--accent)' : 'var(--bg-surface)', 
      padding: '24px', 
      borderRadius: '24px', 
      border: primary ? 'none' : '1px solid var(--border)', 
      color: primary ? 'white' : 'inherit',
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px', 
      cursor: 'pointer', 
      transition: 'all 0.2s ease',
      boxShadow: primary ? '0 8px 24px rgba(37, 99, 235, 0.2)' : 'var(--shadow-sm)'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      if (primary) e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 99, 235, 0.3)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      if (primary) e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.2)';
    }}
  >
    <div style={{ color: primary ? 'rgba(255,255,255,0.9)' : 'var(--accent)' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: '16px', color: primary ? 'white' : 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: '13px', color: primary ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', fontWeight: 500 }}>{desc}</div>
    </div>
  </div>
);
