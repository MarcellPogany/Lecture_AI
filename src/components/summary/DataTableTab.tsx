import React, { useCallback } from 'react';
import { Download, Table2 } from 'lucide-react';
import { GenerationEmptyState } from './GenerationEmptyState';

interface DataTableTabProps {
  dataTable?: { headers: string[]; rows: string[][] };
  isGenerating?: boolean;
  onGenerate?: () => void;
}

export const DataTableTab: React.FC<DataTableTabProps> = ({ dataTable, isGenerating, onGenerate }) => {
  const exportCSV = useCallback(() => {
    if (!dataTable) return;
    const rows = [dataTable.headers, ...dataTable.rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'lecture_data.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [dataTable]);

  if (!dataTable) {
    return (
      <GenerationEmptyState
        icon={<Table2 size={28} color="var(--accent)" />}
        title="Data Table"
        description="Extract all structured data from this lecture — dates, statistics, comparisons, definitions — into a downloadable spreadsheet."
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        buttonLabel="Generate Data Table"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {dataTable.headers.map((h, i) => (
                <th key={i} style={{ padding: '12px 16px', background: 'var(--accent)', color: 'white', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap', borderRight: i < dataTable.headers.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataTable.rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-muted)' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '10px 16px', color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: ci === 0 ? 600 : 400, borderRight: ci < row.length - 1 ? '1px solid var(--border)' : 'none', borderTop: '1px solid var(--border)', lineHeight: '1.5' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
        {dataTable.rows.length} rows · {dataTable.headers.length} columns
      </div>
    </div>
  );
};
