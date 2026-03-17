import React, { useState } from 'react';
import { Session, Summary } from '../types';
import { SessionHeader } from './SessionHeader';
import { TranscriptView } from './TranscriptView';
import { SummaryView } from './SummaryView';
import { RecordingOverlay } from './RecordingOverlay';
import { EmptyState } from './EmptyState';
import { FileText, Sparkles, AlertCircle } from 'lucide-react';

interface MainContentProps {
  activeSession: Session | null;
  isRecording: boolean;
  isUploading: boolean;
  isSummarizing: boolean;
  interimText: string;
  recordingTime: number;
  formatTime: (s: number) => string;
  stopRecording: () => void;
  startRecording: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSummarize: () => void;
  updateSession: (id: string, updates: any) => void;
  selectedText: string;
  isSelectedGeneratingTTS: boolean;
  selectedTtsAudioUrl: string | null;
  transcriptRef: React.RefObject<HTMLTextAreaElement>;
  handleTranscriptSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  handleGenerateSelectionTTS: () => void;
  activeTab: any;
  setActiveTab: (tab: any) => void;
  ttsAudioUrl: string | null;
  isGeneratingTTS: boolean;
  ttsAudioRef: React.RefObject<HTMLAudioElement>;
  handleGenerateTTS: (text: string) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  handleAddAttachment: (e: React.ChangeEvent<HTMLInputElement>) => Promise<boolean>;
  handleRemoveAttachment: (id: string) => void;
}

export function MainContent({
  activeSession,
  isRecording,
  isUploading,
  isSummarizing,
  interimText,
  recordingTime,
  formatTime,
  stopRecording,
  startRecording,
  handleFileUpload,
  handleSummarize,
  updateSession,
  selectedText,
  isSelectedGeneratingTTS,
  selectedTtsAudioUrl,
  transcriptRef,
  handleTranscriptSelect,
  handleGenerateSelectionTTS,
  activeTab,
  setActiveTab,
  ttsAudioUrl,
  isGeneratingTTS,
  ttsAudioRef,
  handleGenerateTTS,
  audioRef,
  handleAddAttachment,
  handleRemoveAttachment
}: MainContentProps) {
  const [mainTab, setMainTab] = useState<'transcript' | 'summary'>('transcript');
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);

  if (!activeSession) {
    return <EmptyState isUploading={isUploading} onStartRecording={startRecording} onFileUpload={handleFileUpload} />;
  }

  const showRecordingOverlay = isRecording;

  const onAddAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const success = await handleAddAttachment(e);
    if (success && activeSession.summary) {
      setShowRegeneratePrompt(true);
    }
  };

  const onRegenerate = () => {
    setShowRegeneratePrompt(false);
    handleSummarize();
    setMainTab('summary');
  };

  return (
    <>
      {showRecordingOverlay && (
        <RecordingOverlay 
          activeSession={activeSession} 
          interimText={interimText} 
          recordingTime={recordingTime} 
          formatTime={formatTime} 
          onStop={stopRecording} 
        />
      )}
      <SessionHeader
        session={activeSession}
        audioRef={audioRef}
        onTitleChange={title => updateSession(activeSession.id, { title })}
        onTagChange={courseTag => updateSession(activeSession.id, { courseTag })}
      />
      
      <div style={{ padding: '0 32px', display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setMainTab('transcript')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            borderBottom: mainTab === 'transcript' ? '2px solid var(--accent)' : '2px solid transparent',
            color: mainTab === 'transcript' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: mainTab === 'transcript' ? 600 : 500,
            fontSize: '14px', transition: 'all 0.2s'
          }}
        >
          <FileText size={16} />
          Transcript & Documents
        </button>
        <button
          onClick={() => setMainTab('summary')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            borderBottom: mainTab === 'summary' ? '2px solid var(--accent)' : '2px solid transparent',
            color: mainTab === 'summary' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: mainTab === 'summary' ? 600 : 500,
            fontSize: '14px', transition: 'all 0.2s'
          }}
        >
          <Sparkles size={16} />
          AI Summary
        </button>
      </div>

      {showRegeneratePrompt && (
        <div style={{ margin: '16px 32px 0', padding: '12px 16px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={18} color="var(--accent)" />
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
              You added a new document. Would you like to regenerate the AI summary to include it?
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowRegeneratePrompt(false)}
              style={{ background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Dismiss
            </button>
            <button
              onClick={onRegenerate}
              disabled={isSummarizing}
              style={{ background: 'var(--accent)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
            >
              {isSummarizing ? 'Regenerating...' : 'Regenerate Summary'}
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', padding: '20px 32px 24px', minHeight: 0 }}>
        {mainTab === 'transcript' ? (
          <TranscriptView
            activeSession={activeSession}
            isSummarizing={isSummarizing}
            isRecording={isRecording}
            recordingSessionId={isRecording ? activeSession.id : null}
            interimText={interimText}
            selectedText={selectedText}
            isSelectedGeneratingTTS={isSelectedGeneratingTTS}
            selectedTtsAudioUrl={selectedTtsAudioUrl}
            transcriptRef={transcriptRef}
            onSummarize={() => {
              handleSummarize();
              setMainTab('summary');
            }}
            onTranscriptSelect={handleTranscriptSelect}
            onTranscriptChange={transcript => updateSession(activeSession.id, { transcript })}
            onGenerateSelectionTTS={handleGenerateSelectionTTS}
            onAddAttachment={onAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
          />
        ) : (
          <SummaryView
            activeSession={activeSession}
            activeTab={activeTab}
            ttsAudioUrl={ttsAudioUrl}
            isGeneratingTTS={isGeneratingTTS}
            isSummarizing={isSummarizing}
            ttsAudioRef={ttsAudioRef}
            onTabChange={setActiveTab}
            onGenerateTTS={handleGenerateTTS}
          />
        )}
      </div>
    </>
  );
}
