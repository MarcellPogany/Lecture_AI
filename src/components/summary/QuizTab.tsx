import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../../types';

interface QuizTabProps {
  questions: QuizQuestion[];
}

type UserAnswer = number | null;

export const QuizTab: React.FC<QuizTabProps> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState<boolean[]>(Array(questions.length).fill(false));
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        No quiz questions generated. Please regenerate the AI Summary.
      </div>
    );
  }

  const q = questions[currentIndex];
  const userAnswer = answers[currentIndex];
  const isSubmitted = submitted[currentIndex];
  const isCorrect = userAnswer === q.correctIndex;

  const handleSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
    // Auto-submit on select
    const newSubmitted = [...submitted];
    newSubmitted[currentIndex] = true;
    setSubmitted(newSubmitted);
  };

  const totalAnswered = submitted.filter(Boolean).length;
  const totalCorrect = answers.filter((a, i) => a === questions[i].correctIndex && submitted[i]).length;

  const difficultyColor: Record<string, string> = {
    recall: '#6366f1',
    comprehension: '#f59e0b',
    application: '#10b981'
  };
  const difficultyLabel: Record<string, string> = {
    recall: 'Recall',
    comprehension: 'Comprehension',
    application: 'Application'
  };

  if (showResults) {
    const byDifficulty = ['recall', 'comprehension', 'application'].map(diff => {
      const qs = questions.filter(q => q.difficulty === diff);
      const correct = qs.filter((q, i) => {
        const qi = questions.indexOf(q);
        return answers[qi] === q.correctIndex;
      }).length;
      return { diff, total: qs.length, correct };
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', padding: '24px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
            {totalCorrect}/{questions.length}
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
            {totalCorrect >= questions.length * 0.8 ? '🎉 Excellent work!' : totalCorrect >= questions.length * 0.6 ? '👍 Good effort!' : '📚 Keep studying!'}
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {byDifficulty.map(({ diff, total, correct }) => (
            <div key={diff} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                background: `${difficultyColor[diff]}15`, color: difficultyColor[diff],
                minWidth: '110px', textAlign: 'center'
              }}>
                {difficultyLabel[diff]}
              </span>
              <div style={{ flex: 1, height: '8px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: difficultyColor[diff],
                  width: total > 0 ? `${(correct / total) * 100}%` : '0%',
                  borderRadius: '4px', transition: 'width 0.5s ease'
                }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', minWidth: '40px' }}>
                {correct}/{total}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setCurrentIndex(0);
            setAnswers(Array(questions.length).fill(null));
            setSubmitted(Array(questions.length).fill(false));
            setShowResults(false);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px',
            borderRadius: '12px', background: 'var(--accent)', color: 'white',
            border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <RotateCcw size={16} /> Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            background: `${difficultyColor[q.difficulty] || '#6366f1'}15`,
            color: difficultyColor[q.difficulty] || '#6366f1'
          }}>
            {difficultyLabel[q.difficulty] || q.difficulty}
          </span>
        </div>
        <div style={{ height: '4px', background: 'var(--bg-muted)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'var(--accent)',
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            borderRadius: '2px', transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.6', fontFamily: 'Georgia, serif' }}>
        {q.question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((option, i) => {
          let bg = 'var(--bg-surface)';
          let border = 'var(--border)';
          let color = 'var(--text-primary)';
          let icon = null;

          if (isSubmitted) {
            if (i === q.correctIndex) {
              bg = '#10b98115'; border = '#10b981'; color = '#065f46';
              icon = <CheckCircle size={16} color="#10b981" />;
            } else if (i === userAnswer) {
              bg = '#ef444415'; border = '#ef4444'; color = '#7f1d1d';
              icon = <XCircle size={16} color="#ef4444" />;
            }
          } else if (i === userAnswer) {
            bg = 'var(--accent-soft)'; border = 'var(--accent)';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isSubmitted}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px', borderRadius: '12px',
                border: `1.5px solid ${border}`, background: bg,
                cursor: isSubmitted ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all 0.2s', color,
                fontSize: '14px', fontWeight: 500, lineHeight: '1.5'
              }}
            >
              <span style={{
                flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%',
                background: isSubmitted && i === q.correctIndex ? '#10b981' :
                  isSubmitted && i === userAnswer ? '#ef4444' : 'var(--bg-muted)',
                color: (isSubmitted && (i === q.correctIndex || i === userAnswer)) ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700
              }}>
                {['A', 'B', 'C', 'D'][i]}
              </span>
              <span style={{ flex: 1 }}>{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isSubmitted && (
        <div style={{
          padding: '14px 18px', borderRadius: '10px',
          background: isCorrect ? '#10b98110' : '#ef444410',
          border: `1px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
          fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6'
        }}>
          <span style={{ fontWeight: 700, color: isCorrect ? '#065f46' : '#7f1d1d' }}>
            {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
          </span>
          {q.explanation}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
        <button
          onClick={() => { setCurrentIndex(i => i - 1); }}
          disabled={currentIndex === 0}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)',
            background: 'var(--bg-surface)', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            fontWeight: 600, fontSize: '13px', transition: 'all 0.2s'
          }}
        >
          ← Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            disabled={!isSubmitted}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: isSubmitted ? 'var(--accent)' : 'var(--bg-muted)',
              color: isSubmitted ? 'white' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '13px', cursor: isSubmitted ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!submitted.every(Boolean)}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: submitted.every(Boolean) ? 'var(--accent)' : 'var(--bg-muted)',
              color: submitted.every(Boolean) ? 'white' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '13px',
              cursor: submitted.every(Boolean) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            See Results
          </button>
        )}
      </div>
    </div>
  );
};
