import React from 'react';

export const LiveIndicator: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.08}s`, background: '#ef4444' }} />
      ))}
    </div>
    <span style={{ fontSize: '12px', fontWeight: 600, color: '#fca5a5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live transcription active</span>
  </div>
);
