import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; semester?: string; professor?: string }) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [professor, setProfessor] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ 
      name: name.trim(), 
      semester: semester.trim() || undefined, 
      professor: professor.trim() || undefined 
    });
    // Reset form
    setName('');
    setSemester('');
    setProfessor('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 32px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
              Create New Course
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
              Add a new course to organize your lectures and notes.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', marginTop: '-4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Course Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Intro to Psychology 101" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              style={{
                padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '15px',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#35415B'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Semester (Optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Fall 2024" 
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              style={{
                padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '15px',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#35415B'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Professor (Optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Dr. Jane Smith" 
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              style={{
                padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '15px',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#35415B'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            style={{ 
              marginTop: '12px',
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: name.trim() ? '#35415B' : '#94A3B8',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              fontSize: '15px',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s ease',
              boxShadow: name.trim() ? '0 4px 12px rgba(53, 65, 91, 0.2)' : 'none'
            }}
          >
            Create Course
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};
