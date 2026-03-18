import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, Download } from 'lucide-react';
import { Flashcard } from '../../types';

interface FlashcardsTabProps {
  flashcards: Flashcard[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function exportCSV(cards: Flashcard[]) {
  const rows = ['Front,Back', ...cards.map(c => `"${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}"`)];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'flashcards.csv'; a.click();
  URL.revokeObjectURL(url);
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({ flashcards }) => {
  const [deck, setDeck] = useState<Flashcard[]>(flashcards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleShuffle = useCallback(() => {
    setDeck(shuffleArray(flashcards));
    setIndex(0);
    setFlipped(false);
  }, [flashcards]);

  const goTo = (i: number) => {
    setIndex(i);
    setFlipped(false);
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        No flashcards generated yet. Generate an AI Summary to create flashcards.
      </div>
    );
  }

  const card = deck[index];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '8px 0' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '600px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Card {index + 1} of {deck.length}
        </span>
        <div style={{ flex: 1, height: '4px', background: 'var(--bg-muted)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'var(--accent)',
            width: `${((index + 1) / deck.length) * 100}%`,
            borderRadius: '2px', transition: 'width 0.3s ease'
          }} />
        </div>
        <button
          onClick={handleShuffle}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s' }}
        >
          <Shuffle size={13} /> Shuffle
        </button>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          width: '100%', maxWidth: '600px', minHeight: '260px',
          background: flipped ? 'var(--accent)' : 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(53,65,91,0.12)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px', cursor: 'pointer', transition: 'all 0.35s ease',
          userSelect: 'none'
        }}
      >
        <div style={{
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: flipped ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginBottom: '16px'
        }}>
          {flipped ? 'Answer' : 'Question'} — tap to flip
        </div>
        <p style={{
          margin: 0, fontSize: '17px', lineHeight: '1.7', textAlign: 'center',
          color: flipped ? 'white' : 'var(--text-primary)', fontWeight: flipped ? 500 : 700,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          {flipped ? card.back : card.front}
        </p>
        <div style={{ marginTop: '20px' }}>
          <RotateCcw size={16} color={flipped ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)'} />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          style={{
            width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border)',
            background: index === 0 ? 'var(--bg-muted)' : 'var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: index === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            color: index === 0 ? 'var(--text-muted)' : 'var(--text-primary)'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Dot nav for small decks */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {deck.slice(Math.max(0, index - 3), Math.min(deck.length, index + 4)).map((_, ri) => {
            const realIndex = Math.max(0, index - 3) + ri;
            return (
              <button
                key={realIndex}
                onClick={() => goTo(realIndex)}
                style={{
                  width: realIndex === index ? '24px' : '8px', height: '8px', borderRadius: '4px',
                  background: realIndex === index ? 'var(--accent)' : 'var(--border)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0
                }}
              />
            );
          })}
        </div>

        <button
          onClick={() => goTo(index + 1)}
          disabled={index === deck.length - 1}
          style={{
            width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border)',
            background: index === deck.length - 1 ? 'var(--bg-muted)' : 'var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: index === deck.length - 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            color: index === deck.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => exportCSV(flashcards)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s' }}
        >
          <Download size={13} /> Export CSV
        </button>
      </div>
    </div>
  );
};
