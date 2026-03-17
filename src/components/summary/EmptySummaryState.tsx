import React from 'react';
import { BookOpen } from 'lucide-react';

export const EmptySummaryState: React.FC = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '12px', gap: '12px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <BookOpen size={22} color="var(--text-muted)" />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>No summary yet</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Generate a summary to see insights here</div>
    </div>
  </div>
);
