import React, { useRef } from 'react';
import { CheckCircle, AlertCircle, FileText, Printer, Download } from 'lucide-react';
import { Summary } from '../../types';

interface DetailedSummaryTabProps {
  summary: Summary;
}

const SourcesBadge: React.FC<{ summary: Summary }> = ({ summary }) => {
  const sources = summary.sources || [];
  if (sources.length === 0) return null;
  return (
    <div className="no-print" style={{
      background: 'var(--bg-muted)', borderRadius: '12px', padding: '16px 20px',
      marginBottom: '32px', border: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <FileText size={14} color="var(--accent)" />
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
          Sources Analyzed
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sources.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            {s.cannotParse
              ? <AlertCircle size={14} color="var(--error)" />
              : <CheckCircle size={14} color="var(--success)" />
            }
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
            {s.meta && <span style={{ color: 'var(--text-muted)' }}>— {s.meta}</span>}
            {s.cannotParse && <span style={{ color: 'var(--error)', fontWeight: 600 }}>Could not be parsed — please re-upload</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DetailedSummaryTab: React.FC<DetailedSummaryTabProps> = ({ summary }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-content, .printable-content * { visibility: visible; }
          .printable-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 40px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={handlePrint}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--accent)', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '10px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}
        >
          <Printer size={16} />
          Export Study Guide
        </button>
      </div>

      <div ref={printRef} className="printable-content">
        <SourcesBadge summary={summary} />

        {/* TL;DR */}
        {summary.tldr && (
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-glow), var(--bg-muted))',
            border: '1px solid var(--border)', borderRadius: '12px',
            padding: '20px 24px', marginBottom: '32px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '8px' }}>TL;DR</div>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.75', color: 'var(--text-primary)', fontStyle: 'italic' }}
              dangerouslySetInnerHTML={{ __html: summary.tldr }} />
          </div>
        )}

        {/* Introduction */}
        {summary.introductionParagraph && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{
              margin: 0, fontSize: '15px', lineHeight: '1.85',
              color: 'var(--text-primary)', fontFamily: 'Georgia, "Times New Roman", serif'
            }}
              dangerouslySetInnerHTML={{ __html: summary.introductionParagraph }}
            />
          </div>
        )}

        {/* Topic Blocks */}
        {summary.topicBlocks && summary.topicBlocks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '36px' }}>
            {summary.topicBlocks.map((block, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                  <span style={{
                    flexShrink: 0, width: '28px', height: '28px', borderRadius: '8px',
                    background: 'var(--accent)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 800, marginTop: '2px'
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      {block.heading}
                    </h3>
                    {block.sources && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Source: {block.sources}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ paddingLeft: '42px' }}>
                  <p style={{
                    margin: 0, fontSize: '14px', lineHeight: '1.9',
                    color: 'var(--text-secondary)', fontFamily: 'Georgia, "Times New Roman", serif'
                  }}
                    dangerouslySetInnerHTML={{ __html: block.body }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : summary.detailedSummary && summary.detailedSummary.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '36px' }}>
            {summary.detailedSummary.map((section, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {section.topic}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.85', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-print" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            No detailed summary available. Generate a summary first.
          </div>
        )}

        {/* Synthesis */}
        {summary.synthesisParagraph && (
          <div style={{
            borderTop: '2px solid var(--border)', paddingTop: '28px', marginBottom: '32px', pageBreakInside: 'avoid'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '12px' }}>
              Synthesis
            </div>
            <p style={{
              margin: 0, fontSize: '14px', lineHeight: '1.9',
              color: 'var(--text-primary)', fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic'
            }}
              dangerouslySetInnerHTML={{ __html: summary.synthesisParagraph }}
            />
          </div>
        )}

        {/* Key Concepts */}
        {summary.keyConcepts && summary.keyConcepts.length > 0 && (
          <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Key Concepts</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {summary.keyConcepts.map((c, i) => (
                <span key={i} style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--border)'
                }} dangerouslySetInnerHTML={{ __html: c }} />
              ))}
            </div>
          </div>
        )}

        {/* Glossary */}
        {summary.glossary && summary.glossary.length > 0 && (
          <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Glossary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {summary.glossary.map((item, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-muted)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginRight: '8px' }}
                    dangerouslySetInnerHTML={{ __html: item.term }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
                    dangerouslySetInnerHTML={{ __html: item.definition }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Questions */}
        {summary.studyQuestions && summary.studyQuestions.length > 0 && (
          <div style={{ pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Study Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {summary.studyQuestions.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'var(--accent-glow)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', minWidth: '20px' }}>{i + 1}.</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: q }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
