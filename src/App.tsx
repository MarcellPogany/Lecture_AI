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
import { HomeContent } from './components/dashboard/HomeContent';
import { CoursesPage } from './components/dashboard/CoursesPage';
import { NewSessionPage } from './components/dashboard/NewSessionPage';
import { CourseDetailView } from './components/dashboard/CourseDetailView';
import { useCourses } from './hooks/useCourses';

export default function App() {
  const { user, loading: authLoading } = useAuthContext();
  const userId = user?.id ?? null;

  const { settings, updateSettings } = useSettings();
  const [currentView, setCurrentView] = useState<'dashboard' | 'courses' | 'new-session' | 'settings' | 'session-detail' | 'course-detail'>('dashboard');

  const { sessions, activeSession, activeSessionId, setActiveSessionId, addSession, updateSession, deleteSession } = useSessions(userId);
  const { courses: explicitCourses, deleteCourse } = useCourses(userId);
  const [activeCourse, setActiveCourse] = useState<{ id?: string, name: string } | null>(null);
  const [pendingSessionMeta, setPendingSessionMeta] = useState<{ title: string, courseTag: string, isTab?: boolean } | null>(null);

  const { isRecording, isPaused, interimText, processingText, recordingTime, recordingSource, formatTime, startRecording, pauseRecording, resumeRecording, stopRecording } = useRecording({
    onSessionCreate: (s) => {
      // Auto-tag if inside a course view or if coming from wizard
      const courseTag = pendingSessionMeta?.courseTag || activeCourse?.name || s.courseTag;
      const title = pendingSessionMeta?.title || s.title;
      
      const finalSession = { ...s, title, courseTag };
      
      addSession({ ...finalSession, inputType: 'record' });
      setCurrentView('session-detail');
      setPendingSessionMeta(null);
    },
    onTranscriptUpdate: (id, transcript) => updateSession(id, { transcript }),
    onRecordingFinish: (blob, id) => handleProcessRecording(blob, id),
    transcriptionLanguage: settings.transcriptionLanguage
  });

  const {
    isUploading, isSummarizing, isGeneratingTTS, isSelectedGeneratingTTS,
    ttsAudioUrl, selectedTtsAudioUrl, processAudioFile,
    handleFileUpload, handleSummarize, handleGenerateTTS, handleGenerateSelectionTTS,
    handleAddAttachment, handleRemoveAttachment,
    isChatLoading, isGeneratingPodcast, isGeneratingMindMap, isGeneratingDataTable, isGeneratingSlides,
    isAddingSource,
    handleAsk, handleGeneratePodcast, handleGenerateMindMap, handleGenerateDataTable, handleGenerateSlides,
    handleAddSourceUrl, handleAddSourceYouTube, processDocumentFiles, processAudioFiles, handleAppendAudio,
    handleProcessRecording, handleRecordLive, handleRecordTab,
  } = useAppHandlers({ userId, addSession, updateSession, activeSession, ttsVoice: settings.ttsVoice });


  const [activeTab, setActiveTab] = useState<string>('detailed');
  const [selectedText, setSelectedText]               = useState('');
  
  const audioRef      = useRef<HTMLAudioElement>(null);
  const ttsAudioRef   = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setSelectedText(''); }, [activeSessionId]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;

  const onSelectSession = (id: string, view: 'session-detail' | undefined = 'session-detail') => {
    setActiveSessionId(id);
    setCurrentView(view);
  };

  const onSelectCourse = (courseReq: { id?: string, name: string }) => {
    setActiveCourse(courseReq);
    setCurrentView('course-detail');
  };

  const onStartRecording = () => {
    startRecording();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', overflow: 'hidden' }}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isRecording={isRecording}
        isUploading={isUploading}
        currentView={currentView}
        onSelectSession={onSelectSession}
        onDeleteSession={deleteSession}
        onStartRecording={onStartRecording}
        onStopRecording={stopRecording}
        onFileUpload={handleFileUpload}
        onNavigate={setCurrentView}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
        {currentView === 'settings' ? (
          <SettingsPage settings={settings} updateSettings={updateSettings} />
        ) : currentView === 'dashboard' ? (
          <HomeContent 
            sessions={sessions} 
            onStartRecording={onStartRecording} 
            onFileUpload={handleFileUpload} 
            onSelectSession={onSelectSession}
            onDeleteSession={deleteSession}
            isUploading={isUploading}
          />
        ) : currentView === 'courses' ? (
          <CoursesPage 
            sessions={sessions} 
            onSelectCourse={onSelectCourse} 
            onDeleteCourse={(name, id) => {
              if (id) deleteCourse(id);
              sessions
                .filter(s => (s.courseTag || 'Uncategorized') === name)
                .forEach(s => updateSession(s.id, { courseTag: '' }));
            }}
          />
        ) : currentView === 'new-session' ? (
          <NewSessionPage 
            explicitCourses={explicitCourses}
            onRecordLive={(title, courseTag) => {
              setPendingSessionMeta({ title, courseTag });
              startRecording({ sourceType: 'mic' });
            }}
            onRecordTab={(title, courseTag) => {
              setPendingSessionMeta({ title, courseTag, isTab: true });
              startRecording({ sourceType: 'tab' });
            }}
            onUploadAudio={async (files, title, courseTag) => {
              const finalId = await processAudioFiles(files, title, courseTag);
              if (finalId) onSelectSession(finalId);
            }}
            onImportYouTube={async (url, title, courseTag) => {
              const { fetchYouTubeTranscript, extractYouTubeId } = await import('./api/sources');
              const videoId = extractYouTubeId(url);
              if (!videoId) { alert('Invalid YouTube URL'); return; }
              const { text } = await fetchYouTubeTranscript(videoId);
              const newSession = {
                id: crypto.randomUUID(),
                title,
                courseTag,
                date: new Date().toISOString(),
                transcript: text,
                summary: null,
                inputType: 'url' as const,
                status: 'transcribed' as const,
                sources: [{ id: crypto.randomUUID(), type: 'youtube' as const, name: `YouTube: ${url}`, url, text, dateAdded: new Date().toISOString() }]
              };
              addSession(newSession);
              onSelectSession(newSession.id);
            }}
            onImportUrl={async (url, title, courseTag) => {
              const { fetchUrlText } = await import('./api/sources');
              const text = await fetchUrlText(url);
              const newSession = {
                id: crypto.randomUUID(),
                title,
                courseTag,
                date: new Date().toISOString(),
                transcript: text,
                summary: null,
                inputType: 'url' as const,
                status: 'transcribed' as const,
                sources: [{ id: crypto.randomUUID(), type: 'url' as const, name: url, url, text, dateAdded: new Date().toISOString() }]
              };
              addSession(newSession);
              onSelectSession(newSession.id);
            }}
            onPasteText={(text, title, courseTag) => {
              const newSession = {
                id: crypto.randomUUID(),
                title,
                courseTag,
                date: new Date().toISOString(),
                transcript: text,
                summary: null,
                inputType: 'paste' as const,
                status: 'transcribed' as const,
                sources: [{ id: crypto.randomUUID(), type: 'paste' as const, name: 'Pasted Content', text, dateAdded: new Date().toISOString() }]
              };
              addSession(newSession);
              onSelectSession(newSession.id);
            }}
            onUploadDocuments={async (files, title, courseTag) => {
              const lastId = await processDocumentFiles(files, title, courseTag);
              if (lastId) onSelectSession(lastId);
            }}
            isUploading={isUploading}
            onCancel={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'course-detail' && activeCourse ? (
          <CourseDetailView 
            courseName={activeCourse.name}
            courseId={activeCourse.id}
            explicitCourses={explicitCourses}
            sessions={sessions}
            onBack={() => setCurrentView('courses')}
            onSelectSession={onSelectSession}
            onAddSession={() => setCurrentView('new-session')}
            onDeleteSession={deleteSession}
          />
        ) : (
          <>
            <Navbar activeSession={activeSession} />
            <MainContent
              activeSession={activeSession}
              isRecording={isRecording}
              isUploading={isUploading}
              isSummarizing={isSummarizing}
              interimText={interimText}
              processingText={processingText}
              recordingTime={recordingTime}
              recordingSource={recordingSource}
              formatTime={formatTime}
              isPaused={isPaused}
              onPause={pauseRecording}
              onResume={resumeRecording}
              onStop={stopRecording}
              pauseRecording={pauseRecording}
              resumeRecording={resumeRecording}
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
              onResumeRecording={() => {
                if (activeSession) {
                  startRecording({ 
                    sessionId: activeSession.id, 
                    initialTranscript: activeSession.transcript 
                  });
                }
              }}
              isChatLoading={isChatLoading}
              isGeneratingPodcast={isGeneratingPodcast}
              isGeneratingMindMap={isGeneratingMindMap}
              isGeneratingDataTable={isGeneratingDataTable}
              isGeneratingSlides={isGeneratingSlides}
              onAsk={handleAsk}
              onGeneratePodcast={handleGeneratePodcast}
              onGenerateMindMap={handleGenerateMindMap}
              onGenerateDataTable={handleGenerateDataTable}
              onGenerateSlides={handleGenerateSlides}
              isAddingSource={isAddingSource}
              handleAddSourceUrl={handleAddSourceUrl}
              handleAddSourceYouTube={handleAddSourceYouTube}
              onAppendAudio={handleAppendAudio}
            />
          </>
        )}
      </div>
    </div>
  );
}
