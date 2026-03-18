import React, { useState } from 'react';
import { Play, Pause, Mic2, Volume2 } from 'lucide-react';
import { PodcastTurn } from '../../types';
import { GenerationEmptyState } from './GenerationEmptyState';

interface PodcastTabProps {
  podcastScript: PodcastTurn[];
  isGenerating?: boolean;
  onGenerate?: () => void;
}

const HOST_NAMES = { A: 'Alex', B: 'Sam' };
const HOST_COLORS = { A: 'var(--accent)', B: '#10b981' };
const HOST_BG = { A: 'rgba(53,65,91,0.08)', B: 'rgba(16,185,129,0.08)' };

export const PodcastTab: React.FC<PodcastTabProps> = ({ podcastScript, isGenerating, onGenerate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);

  const playTurn = (index: number) => {
    if (index >= podcastScript.length) {
      setIsPlaying(false);
      setCurrentTurn(0);
      return;
    }
    const turn = podcastScript[index];
    const u = new SpeechSynthesisUtterance(turn.text);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria')));
    const maleVoice = voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('samantha'));
    if (turn.host === 'A' && maleVoice) u.voice = maleVoice;
    if (turn.host === 'B' && femaleVoice) u.voice = femaleVoice;
    u.rate = 1.05;
    u.onend = () => {
      setCurrentTurn(index + 1);
      playTurn(index + 1);
    };
    window.speechSynthesis.speak(u);
    setCurrentTurn(index);
  };

  const handlePlay = () => {
    if (!window.speechSynthesis) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    playTurn(currentTurn);
  };

  if (!podcastScript || podcastScript.length === 0) {
    return (
      <GenerationEmptyState
        icon={<Mic2 size={28} color="var(--accent)" />}
        title="Audio Overview"
        description="Generate a podcast-style dialogue where two AI hosts discuss this lecture in an engaging, accessible way."
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        buttonLabel="Generate Audio Overview"
      />
    );
  }

  const progress = ((currentTurn + 1) / podcastScript.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'var(--accent)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={handlePlay} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
          {isPlaying ? <Pause size={20} color="var(--accent)" fill="var(--accent)" /> : <Play size={20} color="var(--accent)" fill="var(--accent)" />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            Audio Overview — Alex & Sam
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'white', borderRadius: '2px', width: `${isPlaying ? progress : 0}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
          <Volume2 size={14} />
          {podcastScript.length} turns
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {podcastScript.map((turn, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', opacity: isPlaying && i !== currentTurn ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: HOST_BG[turn.host], border: `2px solid ${HOST_COLORS[turn.host]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 800, color: HOST_COLORS[turn.host] }}>
              {HOST_NAMES[turn.host][0]}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: HOST_COLORS[turn.host], display: 'block', marginBottom: '4px' }}>
                {HOST_NAMES[turn.host]}
              </span>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>
                {turn.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
