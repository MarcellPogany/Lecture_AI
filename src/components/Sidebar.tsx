import React from 'react';
import { BookOpen, Home, History, Settings } from 'lucide-react';
import { Session } from '../types';
import { NavItem } from './sidebar/NavItem';
import { SessionItem } from './sidebar/SessionItem';
import { SidebarActions } from './sidebar/SidebarActions';
import { UserFooter } from './sidebar/UserFooter';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  isRecording: boolean;
  isUploading: boolean;
  currentView: 'home' | 'settings';
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNavigate: (view: 'home' | 'settings') => void;
}

function getTagStyle(courseTag: string): string {
  const tag = courseTag.toLowerCase();
  if (tag.includes('cs') || tag.includes('computer') || tag.includes('algo') || tag.includes('code')) return 'tag-cs';
  if (tag.includes('bio') || tag.includes('chem') || tag.includes('phys')) return 'tag-bio';
  if (tag.includes('math') || tag.includes('calc') || tag.includes('stat')) return 'tag-math';
  if (tag === 'live') return 'tag-live';
  return 'tag-default';
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
      <div style={{ padding: '12px 12px 0' }}>
        <NavItem icon={<Home size={15} />} label="Home" onClick={() => onNavigate('home')} />
        <NavItem icon={<History size={15} />} label="All Sessions" active={currentView === 'home'} onClick={() => onNavigate('home')} />
        <NavItem icon={<Settings size={15} />} label="Settings" active={currentView === 'settings'} onClick={() => onNavigate('settings')} />
      </div>

      <div style={{ padding: '16px 12px 8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '8px' }}>Sessions</span>
      </div>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No sessions yet</div>
        ) : (
          sessions.map(session => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={currentView === 'home' && activeSessionId === session.id}
              onSelect={() => {
                onSelectSession(session.id);
                onNavigate('home');
              }}
              onDelete={() => onDeleteSession(session.id)}
              tagStyle={getTagStyle(session.courseTag)}
            />
          ))
        )}
      </div>

      <SidebarActions
        isRecording={isRecording}
        isUploading={isUploading}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onFileUpload={onFileUpload}
      />

      <UserFooter />
    </div>
  );
};
