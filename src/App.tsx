import React, { useRef, useState, useEffect } from 'react';
import { useSessions } from './hooks/useSessions';
import { useRecording } from './hooks/useRecording';
import { useAuthContext } from './context/AuthContext';
import { useAppHandlers } from './hooks/useAppHandlers';
import { useSettings } from './hooks/useSettings';

import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/auth/AuthScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { MainContent } from './components/MainContent';
import { SettingsPage } from './components/SettingsPage';

export default function App() {
  const { user, loading: authLoading } = useAuthContext();
  const userId = user?.id ?? null;

  const { settings, updateSettings } = useSettings();
  const [currentView, setCurrentView] = useState<'home' | 'settings'>('home');

  const { sessions, activeSession, activeSessionId, setActiveSessionId, addSession, updateSession, deleteSession } = useSessions(userId);

  const { isRecording, interimText, recordingTime, formatTime, startRecording, stopRecording } = useRecording({
    onSessionCreate: (s) => addSession({ ...s, inputType: 'record' }),
    onTranscriptUpdate: (id, transcript) => updateSession(id, { transcript }),
    transcriptionLanguage: settings.transcriptionLanguage
  });

  const {
    isUploading, isSummarizing, isGeneratingTTS, isSelectedGeneratingTTS,
    ttsAudioUrl, selectedTtsAudioUrl,
    handleFileUpload, handleSummarize, handleGenerateTTS, handleGenerateSelectionTTS,
    handleAddAttachment, handleRemoveAttachment
  } = useAppHandlers({ userId, addSession, updateSession, activeSession, ttsVoice: settings.ttsVoice });

  const [activeTab, setActiveTab]                     = useState<'tldr' | 'concepts' | 'detailed' | 'glossary' | 'questions'>('tldr');
  const [selectedText, setSelectedText]               = useState('');
  
  const audioRef      = useRef<HTMLAudioElement>(null);
  const ttsAudioRef   = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setSelectedText(''); }, [activeSessionId]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', overflow: 'hidden' }}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isRecording={isRecording}
        isUploading={isUploading}
        currentView={currentView}
        onSelectSession={setActiveSessionId}
        onDeleteSession={deleteSession}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onFileUpload={handleFileUpload}
        onNavigate={setCurrentView}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
        {currentView === 'settings' ? (
          <SettingsPage settings={settings} updateSettings={updateSettings} />
        ) : (
          <>
            <Navbar activeSession={activeSession} />
            <MainContent
              activeSession={activeSession}
              isRecording={isRecording}
              isUploading={isUploading}
              isSummarizing={isSummarizing}
              interimText={interimText}
              recordingTime={recordingTime}
              formatTime={formatTime}
              stopRecording={stopRecording}
              startRecording={startRecording}
              handleFileUpload={handleFileUpload}
              handleSummarize={handleSummarize}
              updateSession={updateSession}
              selectedText={selectedText}
              isSelectedGeneratingTTS={isSelectedGeneratingTTS}
              selectedTtsAudioUrl={selectedTtsAudioUrl}
              transcriptRef={transcriptRef}
              handleTranscriptSelect={(e) => {
                const t = e.target as HTMLTextAreaElement;
                setSelectedText(t.value.substring(t.selectionStart, t.selectionEnd));
              }}
              handleGenerateSelectionTTS={() => handleGenerateSelectionTTS(selectedText)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              ttsAudioUrl={ttsAudioUrl}
              isGeneratingTTS={isGeneratingTTS}
              ttsAudioRef={ttsAudioRef}
              handleGenerateTTS={handleGenerateTTS}
              audioRef={audioRef}
              handleAddAttachment={handleAddAttachment}
              handleRemoveAttachment={handleRemoveAttachment}
            />
          </>
        )}
      </div>
    </div>
  );
}
