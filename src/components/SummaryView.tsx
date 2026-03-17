import React, { RefObject } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { Session } from '../types';
import { SummaryTabs } from './summary/SummaryTabs';
import { TabContent } from './summary/TabContent';
import { TtsPlayerBar } from './summary/TtsPlayerBar';
import { EmptySummaryState } from './summary/EmptySummaryState';

interface SummaryViewProps {
  activeSession: Session;
  activeTab: 'tldr' | 'concepts' | 'detailed' | 'glossary' | 'questions';
  ttsAudioUrl: string | null;
  isGeneratingTTS: boolean;
  isSummarizing: boolean;
  ttsAudioRef: RefObject<HTMLAudioElement | null>;
  onTabChange: (tab: 'tldr' | 'concepts' | 'detailed' | 'glossary' | 'questions') => void;
  onGenerateTTS: (text: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  activeSession, activeTab, ttsAudioUrl, isGeneratingTTS, isSummarizing, ttsAudioRef, onTabChange, onGenerateTTS
}) => {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {isSummarizing ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '12px', gap: '16px' }}>
          <Loader2 size={32} color="var(--accent)" className="animate-spin" />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Generating AI Summary...</div>
        </div>
      ) : activeSession.summary ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <SummaryTabs activeTab={activeTab} onTabChange={onTabChange} />
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="animate-fade-in">
            <TabContent 
              activeTab={activeTab} 
              activeSession={activeSession} 
              isGeneratingTTS={isGeneratingTTS} 
              onGenerateTTS={onGenerateTTS} 
            />
          </div>

          {ttsAudioUrl && (
            <TtsPlayerBar 
              ttsAudioUrl={ttsAudioUrl} 
              activeSession={activeSession} 
              ttsAudioRef={ttsAudioRef} 
            />
          )}
        </div>
      ) : (
        <EmptySummaryState />
      )}
    </div>
  );
};
