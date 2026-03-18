import React, { useCallback } from 'react';
import { Download, Network } from 'lucide-react';
import { MindMapNode } from '../../types';
import { GenerationEmptyState } from './GenerationEmptyState';

interface MindMapTabProps {
  mindMap?: MindMapNode;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

const NODE_COLORS = ['var(--accent)', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const TreeNode: React.FC<{ node: MindMapNode; depth: number; colorIndex: number }> = ({ node, depth, colorIndex }) => {
  const color = NODE_COLORS[colorIndex % NODE_COLORS.length];
  const isRoot = depth === 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
      <div style={{
        padding: isRoot ? '10px 20px' : '6px 14px',
        borderRadius: '999px',
        background: isRoot ? color : depth === 1 ? `${color}20` : 'var(--bg-muted)',
        border: `1.5px solid ${isRoot ? 'transparent' : color}`,
        fontSize: isRoot ? '14px' : depth === 1 ? '13px' : '12px',
        fontWeight: isRoot ? 800 : depth === 1 ? 700 : 500,
        color: isRoot ? 'white' : color,
        whiteSpace: 'nowrap',
        boxShadow: isRoot ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.2s',
      }}>
        {node.label}
      </div>
      {node.children && node.children.length > 0 && (
        <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: `2px solid ${color}30`, marginLeft: '12px' }}>
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} colorIndex={colorIndex + i} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MindMapTab: React.FC<MindMapTabProps> = ({ mindMap, isGenerating, onGenerate }) => {
  const exportJSON = useCallback(() => {
    if (!mindMap) return;
    const blob = new Blob([JSON.stringify(mindMap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mindmap.json'; a.click();
    URL.revokeObjectURL(url);
  }, [mindMap]);

  if (!mindMap) {
    return (
      <GenerationEmptyState
        icon={<Network size={28} color="var(--accent)" />}
        title="Visual Mind Map"
        description="Visualize the key concepts and their relationships from this lecture as an interactive hierarchy."
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        buttonLabel="Generate Mind Map"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={exportJSON} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s' }}>
          <Download size={14} /> Export JSON
        </button>
      </div>
      <div style={{ padding: '20px', background: 'var(--bg-muted)', borderRadius: '16px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <TreeNode node={mindMap} depth={0} colorIndex={0} />
      </div>
    </div>
  );
};
