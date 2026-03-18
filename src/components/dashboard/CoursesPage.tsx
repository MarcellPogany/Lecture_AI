import React, { useMemo, useState } from 'react';
import { PlusCircle, BookOpen, MoreVertical, Folder, Calendar } from 'lucide-react';
import { Session, Course } from '../../types';
import { useCourses } from '../../hooks/useCourses';
import { useAuthContext } from '../../context/AuthContext';
import { CreateCourseModal } from './CreateCourseModal';

interface CoursesPageProps {
  sessions: Session[];
  onSelectCourse: (courseReq: { id?: string, name: string }) => void;
  onDeleteCourse?: (name: string, id?: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ sessions, onSelectCourse, onDeleteCourse }) => {
  const { user } = useAuthContext();
  const { courses: explicitCourses, addCourse } = useCourses(user?.id ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Blend explicit courses and implicit session tags
  const displayCourses = useMemo(() => {
    const map = new Map<string, { count: number, latestDate: string, id?: string, semester?: string, professor?: string }>();
    
    // 1. Add explicitly created courses
    explicitCourses.forEach(c => {
      map.set(c.name, { count: 0, latestDate: c.createdAt, id: c.id, semester: c.semester, professor: c.professor });
    });

    // 2. Add sessions (increment counts, add generic tags if they don't exist)
    sessions.forEach(s => {
      const tag = s.courseTag || 'Uncategorized';
      const existing = map.get(tag);
      if (existing) {
        existing.count += 1;
        if (new Date(s.date) > new Date(existing.latestDate)) {
          existing.latestDate = s.date;
        }
      } else {
        // A tag that isn't an explicit course yet
        map.set(tag, { count: 1, latestDate: s.date });
      }
    });
    
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      sessionCount: data.count,
      lastActive: data.latestDate,
      id: data.id,
      semester: data.semester,
      professor: data.professor
    })).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }, [sessions, explicitCourses]);

  const handleCreateCourse = (data: { name: string; semester?: string; professor?: string }) => {
    const created = addCourse(data);
    setIsModalOpen(false);
    if (created) {
      onSelectCourse({ id: created.id, name: created.name });
    }
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg-base)' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>
              Courses
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Organize your sessions and notes by subject.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: '#35415B', color: 'white', 
              border: 'none', padding: '10px 16px', borderRadius: '10px', 
              fontWeight: 500, fontSize: '14px', cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease'
            }}
          >
            <PlusCircle size={18} />
            Create Course
          </button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {displayCourses.map(course => (
            <CourseCard 
              key={course.name} 
              course={course} 
              onClick={() => onSelectCourse({ id: course.id, name: course.name })}
              onDelete={onDeleteCourse && course.name !== 'Uncategorized' ? () => onDeleteCourse(course.name, course.id) : undefined}
            />
          ))}
          {displayCourses.length === 0 && (
            <div style={{ padding: '40px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
              No courses found. Start recording or create a course to see it here.
            </div>
          )}
        </div>
      </div>
      
      <CreateCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateCourse} 
      />
    </>
  );
};

const CourseCard: React.FC<{ 
  course: { id?: string, name: string, sessionCount: number, lastActive: string, semester?: string },
  onClick: () => void,
  onDelete?: () => void
}> = ({ course, onClick, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Simple heuristic for term based on lastActive date
  const date = new Date(course.lastActive);
  const month = date.getMonth();
  const year = date.getFullYear();
  const term = month < 5 ? `Spring ${year}` : month < 8 ? `Summer ${year}` : `Fall ${year}`;

  return (
    <div 
      onClick={onClick}
      style={{ 
      background: 'white', 
      borderRadius: '20px', 
      border: '1px solid #E2E8F0', 
      position: 'relative',
      overflow: 'visible', // Changed to visible for dropdown
      boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.02)';
      setShowMenu(false); // Hide menu if mouse leaves
    }}
    >
      {/* Top emphasis bar - folder tab style */}
      <div style={{ 
        height: '14px', background: '#35415B', width: '85%', 
        position: 'absolute', top: 0, left: 0, 
        borderTopLeftRadius: '20px', borderBottomRightRadius: '16px' 
      }} />
      
      <div style={{ padding: '24px', paddingTop: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#35415B' }}>
            <BookOpen size={22} />
          </div>
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
                zIndex: 10, minWidth: '140px', overflow: 'hidden'
              }}>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowMenu(false);
                    if (onDelete && window.confirm('Are you sure you want to delete this course? All included sessions will be moved to Uncategorized.')) {
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
                  Delete Course
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
          {course.name}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <Folder size={16} color="#94A3B8" /> {course.sessionCount} {course.sessionCount === 1 ? 'Session' : 'Sessions'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <Calendar size={16} color="#94A3B8" /> {term}
          </div>
        </div>
      </div>
    </div>
  );
};
