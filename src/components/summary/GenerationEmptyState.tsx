import React, { ReactNode } from 'react';

interface GenerationEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
  buttonLabel: string;
}

export const GenerationEmptyState: React.FC<GenerationEmptyStateProps> = ({
  icon, title, description, onGenerate, isGenerating, buttonLabel
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '60px 20px' }}>
    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.65' }}>
        {description}
      </div>
    </div>
    {onGenerate && (
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px',
          borderRadius: '12px', background: 'var(--accent)', color: 'white',
          border: 'none', fontWeight: 700, fontSize: '14px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          opacity: isGenerating ? 0.7 : 1, transition: 'all 0.2s'
        }}
      >
        {icon && React.cloneElement(icon as React.ReactElement, { size: 16 })}
        {isGenerating ? 'Building...' : buttonLabel}
      </button>
    )}
  </div>
);
