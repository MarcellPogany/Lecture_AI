import React, { RefObject } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Session } from '../types';
import { SummaryTabs } from './summary/SummaryTabs';
import { DetailedSummaryTab } from './summary/DetailedSummaryTab';
import { FlashcardsTab } from './summary/FlashcardsTab';
import { QuizTab } from './summary/QuizTab';
import { PodcastTab } from './summary/PodcastTab';
import { MindMapTab } from './summary/MindMapTab';
import { DataTableTab } from './summary/DataTableTab';
import { SlidesDeckTab } from './summary/SlidesDeckTab';
import { EmptySummaryState } from './summary/EmptySummaryState';

interface SummaryViewProps {
  activeSession: Session;
  activeTab: string;
  ttsAudioUrl: string | null;
  isGeneratingTTS: boolean;
  isSummarizing: boolean;
  ttsAudioRef: RefObject<HTMLAudioElement | null>;
  isGeneratingPodcast?: boolean;
  isGeneratingMindMap?: boolean;
  isGeneratingDataTable?: boolean;
  isGeneratingSlides?: boolean;
  onTabChange: (tab: string) => void;
  onGenerateTTS: (text: string) => void;
  onGeneratePodcast?: () => void;
  onGenerateMindMap?: () => void;
  onGenerateDataTable?: () => void;
  onGenerateSlides?: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  activeSession, activeTab, isSummarizing, onTabChange,
  isGeneratingPodcast, isGeneratingMindMap, isGeneratingDataTable, isGeneratingSlides,
  onGeneratePodcast, onGenerateMindMap, onGenerateDataTable, onGenerateSlides,
}) => {
  if (isSummarizing) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', gap: '16px' }}>
        <Sparkles size={32} color="var(--accent)" className="animate-pulse" />
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Generating AI Summary…</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', textAlign: 'center', lineHeight: '1.6' }}>
          Analyzing all sources and producing detailed notes, flashcards and quiz questions.
        </div>
        <Loader2 size={24} color="var(--accent)" className="animate-spin" />
      </div>
    );
  }

  if (!activeSession.summary) {
    return <EmptySummaryState />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', minWidth: 0 }}>
      <SummaryTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }} className="animate-fade-in">
        {activeTab === 'detailed' && (
          <DetailedSummaryTab summary={activeSession.summary} />
        )}
        {activeTab === 'flashcards' && (
          <FlashcardsTab flashcards={activeSession.summary.flashcards || []} />
        )}
        {activeTab === 'quiz' && (
          <QuizTab questions={activeSession.summary.quiz || []} />
        )}
        {activeTab === 'podcast' && (
          <PodcastTab
            podcastScript={activeSession.podcastScript || []}
            isGenerating={isGeneratingPodcast}
            onGenerate={onGeneratePodcast}
          />
        )}
        {activeTab === 'mindmap' && (
          <MindMapTab
            mindMap={activeSession.mindMap}
            isGenerating={isGeneratingMindMap}
            onGenerate={onGenerateMindMap}
          />
        )}
        {activeTab === 'datatable' && (
          <DataTableTab
            dataTable={activeSession.dataTable}
            isGenerating={isGeneratingDataTable}
            onGenerate={onGenerateDataTable}
          />
        )}
        {activeTab === 'slides' && (
          <SlidesDeckTab
            slides={activeSession.slides}
            isGenerating={isGeneratingSlides}
            onGenerate={onGenerateSlides}
          />
        )}
      </div>
    </div>
  );
};
