import React from 'react';
import { BookOpen, Home, Settings, PlusCircle } from 'lucide-react';
import { Session } from '../types';
import { NavItem } from './sidebar/NavItem';
import { UserFooter } from './sidebar/UserFooter';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  isRecording: boolean;
  isUploading: boolean;
  currentView: 'dashboard' | 'courses' | 'new-session' | 'settings' | 'session-detail';
  onSelectSession: (id: string, view?: 'session-detail') => void;
  onDeleteSession: (id: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNavigate: (view: 'dashboard' | 'courses' | 'new-session' | 'settings' | 'session-detail') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions, activeSessionId, isRecording, isUploading, currentView,
  onSelectSession, onDeleteSession, onStartRecording, onStopRecording, onFileUpload, onNavigate
}) => {
  return (
    <div style={{ width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30,41,59,0.15)' }}>
          <BookOpen size={16} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>LectureAI</span>
      </div>

      {/* Nav links */}
      <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '12px', marginBottom: '8px' }}>Main Menu</span>
        <NavItem icon={<Home size={15} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
        <NavItem icon={<BookOpen size={15} />} label="Courses" active={currentView === 'courses'} onClick={() => onNavigate('courses')} />
        <NavItem icon={<PlusCircle size={15} />} label="New Session" active={currentView === 'new-session'} onClick={() => onNavigate('new-session')} />
        <NavItem icon={<Settings size={15} />} label="Settings" active={currentView === 'settings'} onClick={() => onNavigate('settings')} />
      </div>

      <div style={{ flex: 1 }} />

      <UserFooter />
    </div>
  );
};
