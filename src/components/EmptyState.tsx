import React from 'react';
import { BookOpen, Mic, Upload, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  isUploading: boolean;
  onStartRecording: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isUploading, onStartRecording, onFileUpload }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '48px', padding: '40px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(30,41,59,0.15)' }}>
          <BookOpen size={32} color="white" />
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
          Good {greeting}.
        </h2>
        <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.6' }}>
          Your academic insights are ready. Upload a recording or start live transcription to get started.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={onStartRecording}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', boxShadow: '0 4px 16px rgba(30,41,59,0.15)', transition: 'all 0.2s ease' }}
        >
          <Mic size={18} /> Record Live Session
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}>
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {isUploading ? 'Processing...' : 'Upload Audio'}
          <input type="file" accept="audio/*,.m4a,.mp4" style={{ display: 'none' }} onChange={onFileUpload} disabled={isUploading} />
        </label>
      </div>
    </div>
  );
};
