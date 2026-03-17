import React from 'react';
import { Mic } from 'lucide-react';
import { Session } from '../types';

interface RecordingOverlayProps {
  activeSession: Session;
  interimText: string;
  recordingTime: number;
  formatTime: (s: number) => string;
  onStop: () => void;
}

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  activeSession,
  interimText,
  recordingTime,
  formatTime,
  onStop,
}) => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
    {/* Mic circle */}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(30,41,59,0.05)', animation: 'pulse 2s ease-in-out infinite' }} />
      <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(30,41,59,0.2)' }}>
        <Mic size={36} color="white" />
      </div>
    </div>

    {/* Timer */}
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-3px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {formatTime(recordingTime)}
      </div>
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} className="animate-pulse" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Processing Audio</span>
      </div>
    </div>

    {/* Waveform */}
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '40px' }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.07}s`, background: 'var(--accent)', opacity: 0.8 }} />
      ))}
    </div>

    {/* Live transcript preview */}
    {(activeSession.transcript || interimText) && (
      <div style={{ maxWidth: '600px', textAlign: 'center', padding: '24px 32px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Live Transcription</div>
        <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', fontWeight: 500 }}>
          "...{(activeSession.transcript + (interimText ? ' ' + interimText : '')).slice(-200)}"
        </p>
      </div>
    )}

    {/* Stop button */}
    <button onClick={onStop} style={{ padding: '16px 48px', borderRadius: '14px', fontWeight: 800, fontSize: '16px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 16px rgba(239,68,68,0.25)', transition: 'all 0.2s ease' }}>
      <span style={{ width: '12px', height: '12px', background: 'white', borderRadius: '3px', display: 'inline-block' }} />
      End Recording
    </button>
  </div>
);
