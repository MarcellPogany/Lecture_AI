import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Printer, LayoutTemplate } from 'lucide-react';
import { Slide } from '../../types';
import { GenerationEmptyState } from './GenerationEmptyState';

interface SlidesDeckTabProps {
  slides?: Slide[];
  isGenerating?: boolean;
  onGenerate?: () => void;
}

const SLIDE_BG_PATTERNS = [
  'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)',
  'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
];

export const SlidesDeckTab: React.FC<SlidesDeckTabProps> = ({ slides, isGenerating, onGenerate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const exportPDF = useCallback(() => {
    if (!slides) return;
    const printContent = slides.map((s, i) =>
      `<div class="slide" style="page-break-after:always; padding:40px; font-family:sans-serif; min-height:100vh; background:#1e293b; color:white;">
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:16px;">Slide ${i + 1} of ${slides.length}</div>
        <h1 style="font-size:28px;margin-bottom:20px;">${s.title}</h1>
        <ul style="font-size:16px;line-height:1.8;">${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
       ${s.speakerNote ? `<div style="margin-top:24px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.5)">Note: ${s.speakerNote}</div>` : ''}
      </div>`
    ).join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <GenerationEmptyState
        icon={<LayoutTemplate size={28} color="var(--accent)" />}
        title="Slide Deck"
        description="Auto-generate a 12-slide presentation from this lecture, complete with speaker notes and PDF export."
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        buttonLabel="Generate Slide Deck"
      />
    );
  }

  const slide = slides[currentSlide];
  const bgPattern = SLIDE_BG_PATTERNS[currentSlide % SLIDE_BG_PATTERNS.length];
  const isFirstSlide = currentSlide === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowNotes(n => !n)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: showNotes ? 'var(--accent-soft)' : 'var(--bg-surface)', fontSize: '12px', fontWeight: 600, color: showNotes ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
          <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Printer size={13} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', aspectRatio: '16/9', background: bgPattern, display: 'flex', flexDirection: 'column', justifyContent: isFirstSlide ? 'center' : 'flex-start', padding: isFirstSlide ? '48px' : '36px 48px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
          {currentSlide + 1} / {slides.length}
        </div>
        <h2 style={{ margin: '0 0 20px', fontSize: isFirstSlide ? '32px' : '22px', fontWeight: 800, color: 'white', lineHeight: '1.2', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          {slide.title}
        </h2>
        {slide.bullets.length > 0 && !isFirstSlide && (
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slide.bullets.map((b, i) => (
              <li key={i} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.55', fontWeight: 400 }}>{b}</li>
            ))}
          </ul>
        )}
        {isFirstSlide && slide.bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {slide.bullets.map((b, i) => (
              <div key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 400 }}>{b}</div>
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.15)' }} />
      </div>

      {showNotes && slide.speakerNote && (
        <div style={{ padding: '14px 18px', background: 'var(--bg-muted)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Speaker Notes</div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>{slide.speakerNote}</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
        <button onClick={() => setCurrentSlide(i => Math.max(0, i - 1))} disabled={currentSlide === 0} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', background: currentSlide === 0 ? 'var(--bg-muted)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', color: currentSlide === 0 ? 'var(--text-muted)' : 'var(--text-primary)', transition: 'all 0.2s' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ display: 'flex', gap: '4px' }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? '20px' : '6px', height: '6px', borderRadius: '3px', border: 'none', background: i === currentSlide ? 'var(--accent)' : 'var(--border)', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
        <button onClick={() => setCurrentSlide(i => Math.min(slides.length - 1, i + 1))} disabled={currentSlide === slides.length - 1} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', background: currentSlide === slides.length - 1 ? 'var(--bg-muted)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer', color: currentSlide === slides.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)', transition: 'all 0.2s' }}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
