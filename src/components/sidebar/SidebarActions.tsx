import React from 'react';
import { Mic, Upload, Loader2 } from 'lucide-react';

interface SidebarActionsProps {
  isRecording: boolean;
  isUploading: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SidebarActions: React.FC<SidebarActionsProps> = ({
  isRecording,
  isUploading,
  onStartRecording,
  onStopRecording,
  onFileUpload
}) => {
  return (
    <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
          fontSize: '13px', border: 'none', transition: 'all 0.2s ease', width: '100%',
          background: isRecording ? 'rgba(239,68,68,0.15)' : 'var(--accent)',
          color: isRecording ? '#fca5a5' : 'white',
          outline: isRecording ? '1px solid rgba(239,68,68,0.3)' : 'none'
        }}
      >
        {isRecording ? (
          <>
            <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
              <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', opacity: 0.75 }} />
              <span style={{ position: 'relative', display: 'block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            </span>
            Stop Recording
          </>
        ) : (
          <><Mic size={14} />Record Live</>
        )}
      </button>
      <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
        fontSize: '13px', background: 'var(--bg-muted)', color: 'var(--text-secondary)',
        border: '1px solid var(--border)', transition: 'all 0.2s ease', width: '100%'
      }}>
        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {isUploading ? 'Processing...' : 'Upload Audio'}
        <input type="file" accept="audio/*,.m4a,.mp4" style={{ display: 'none' }} onChange={onFileUpload} disabled={isUploading || isRecording} />
      </label>
    </div>
  );
};
