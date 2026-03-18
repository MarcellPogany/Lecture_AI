import React, { useMemo } from 'react';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import { Session, Course } from '../../types';
import { SessionRowCard } from './HomeContent';

interface CourseDetailViewProps {
  courseName: string;
  courseId?: string;
  explicitCourses: Course[];
  sessions: Session[];
  onBack: () => void;
  onSelectSession: (id: string, view?: 'session-detail') => void;
  onAddSession: () => void;
  onDeleteSession?: (id: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseName, courseId, explicitCourses, sessions, onBack, onSelectSession, onAddSession, onDeleteSession
}) => {
  // Find full details if it's an explicitly created course
  const courseDetails = explicitCourses.find(c => c.id === courseId || c.name === courseName);
  
  // Filter sessions that belong to this course tag
  const courseSessions = useMemo(() => {
    return sessions
      .filter(s => (s.courseTag || 'Uncategorized') === courseName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, courseName]);

  const displaySemester = courseDetails?.semester || 'Term TBA';
  const displayDate = courseDetails 
    ? new Date(courseDetails.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : (courseSessions[courseSessions.length - 1] 
        ? new Date(courseSessions[courseSessions.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown Date');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg-base)' }}>
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginBottom: '32px', padding: 0 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header Card */}
      <div style={{ 
        background: 'var(--bg-surface)', borderRadius: '24px', 
        padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: '1px solid var(--border)', marginBottom: '48px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--bg-base)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1E293B', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
              {courseName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ 
                background: 'var(--bg-base)', border: '1px solid var(--border)', 
                padding: '4px 12px', borderRadius: '100px', fontSize: '12px', 
                fontWeight: 700, color: '#1E293B' 
              }}>
                {displaySemester}
              </span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                Created {displayDate}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onAddSession}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: '#35415B', color: 'white', 
            border: 'none', padding: '12px 24px', borderRadius: '12px', 
            fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(53, 65, 91, 0.15)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={16} /> Add Session
        </button>
      </div>

      {/* Sessions List */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
          Course Sessions
        </h2>

        {courseSessions.length === 0 ? (
          <div style={{ padding: '40px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No sessions recorded yet.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "Add Session" to get started.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {courseSessions.map(session => (
              <div key={session.id} style={{ position: 'relative' }}>
                <SessionRowCard 
                  session={session} 
                  onClick={() => onSelectSession(session.id)}
                  onDelete={onDeleteSession ? () => onDeleteSession(session.id) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
