import React, { useState } from 'react';
import { Summary, Session } from '../types';
import { transcribeAudio, summarizeTranscript, generateTTS } from '../api/openrouter';
import { uploadAudio, getSignedUrl } from '../api/storage';
import { createDbSession, saveTranscript } from '../api/sessions';

const withTimeout = <T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
    promise.then(resolve).catch(reject).finally(() => clearTimeout(timer));
  });
};

interface HandlersProps {
  userId: string | null;
  addSession: (s: any) => void;
  updateSession: (id: string, updates: any) => void;
  activeSession: Session | null;
  ttsVoice: string;
}

export function useAppHandlers({ userId, addSession, updateSession, activeSession, ttsVoice }: HandlersProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [isSelectedGeneratingTTS, setIsSelectedGeneratingTTS] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [selectedTtsAudioUrl, setSelectedTtsAudioUrl] = useState<string | null>(null);

  const processAudioFile = async (file: File, overrideTitle?: string, overrideCourseTag?: string) => {
    setIsUploading(true);
    try {
      let dbSessionId: string | undefined;
      const title = overrideTitle || file.name.replace(/\.[^/.]+$/, '');
      const courseTag = overrideCourseTag || 'Uncategorized';
      if (userId) {
        const db = await withTimeout(createDbSession(userId, title, courseTag, 'upload'), 10000, 'DB session creation timed out');
        dbSessionId = db.id;
      }

      let audioUrl: string | undefined;
      let audioStoragePath: string | undefined;
      if (userId && dbSessionId) {
        try {
          const { storagePath } = await withTimeout(uploadAudio(file, userId, dbSessionId), 30000, 'Audio storage upload timed out');
          audioStoragePath = storagePath;
          audioUrl = await withTimeout(getSignedUrl(storagePath), 10000, 'Signed URL request timed out');
        } catch (storageErr) {
          console.warn('Storage upload failed, proceeding with local object url:', storageErr);
          audioUrl = URL.createObjectURL(file);
        }
      } else {
        audioUrl = URL.createObjectURL(file);
      }

      let transcript = '';
      try {
        transcript = await withTimeout(transcribeAudio(file), 70000, 'Transcription request timed out');
      } catch (transcribeErr: any) {
        console.error('Transcription failed:', transcribeErr);
        transcript = `[Transcription failed: ${transcribeErr.message || 'Unknown error'}. Audio is available.]`;
      }

      if (userId && dbSessionId && transcript && !transcript.startsWith('[Transcription failed')) {
        try {
          await withTimeout(saveTranscript(dbSessionId, userId, transcript), 10000, 'DB transcript save timed out');
        } catch (dbErr) {
          console.error('Failed to save transcription to DB:', dbErr);
        }
      }

      const newId = dbSessionId ?? crypto.randomUUID();
      addSession({
        id: newId,
        dbId: dbSessionId,
        title,
        date: new Date().toISOString(),
        courseTag,
        transcript,
        summary: null,
        audioUrl,
        audioStoragePath,
        inputType: 'upload',
      });
      return newId;
    } catch (err: any) {
      console.error('File Upload/Process error:', err);
      const msg = err.message || 'Unknown error';
      alert(`Process error: ${msg}\n\nCheck console for details.`);
    } finally {
      setIsUploading(false);
    }
  };

  const processDocumentFiles = async (files: File[], overrideTitle?: string, overrideCourseTag?: string) => {
    setIsUploading(true);
    try {
      const title = overrideTitle || files[0].name.replace(/\.[^/.]+$/, '');
      const courseTag = overrideCourseTag || 'Uncategorized';
      
      let dbSessionId: string | undefined;
      if (userId) {
        const db = await withTimeout(createDbSession(userId, title, courseTag, 'upload'), 10000, 'DB session creation timed out');
        dbSessionId = db.id;
      }

      const attachments = [];
      let combinedTranscript = '';

      for (const file of files) {
        const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
        
        const attachment = await new Promise<any>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            
            // For text files, also extract content for the transcript
            if (isText) {
              try {
                const textContent = atob(base64);
                combinedTranscript += `\n\n[File: ${file.name}]\n${textContent}`;
              } catch (e) {
                console.warn('Failed to decode text file:', file.name);
              }
            }

            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              data: base64,
              mimeType: file.type || 'application/octet-stream'
            });
          };
          reader.onerror = () => reject(new Error(`Error reading file ${file.name}`));
          reader.readAsDataURL(file);
        });
        attachments.push(attachment);
      }

      const newId = dbSessionId ?? crypto.randomUUID();
      addSession({
        id: newId,
        dbId: dbSessionId,
        title,
        date: new Date().toISOString(),
        courseTag,
        transcript: combinedTranscript.trim() || '[Document session - Q&A grounded on attachments]',
        summary: null,
        attachments,
        inputType: 'upload',
        status: 'transcribed',
      });
      return newId;
    } catch (err: any) {
      console.error('Document Process error:', err);
      alert(`Error processing documents: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const processAudioFiles = async (files: File[], overrideTitle?: string, overrideCourseTag?: string) => {
    if (!files.length) return;
    setIsUploading(true);
    
    try {
      const title = overrideTitle || files[0].name.replace(/\.[^/.]+$/, '');
      const courseTag = overrideCourseTag || 'Uncategorized';
      
      let dbSessionId: string | undefined;
      const initialId = crypto.randomUUID();
      
      if (userId) {
        const db = await withTimeout(createDbSession(userId, title, courseTag, 'upload'), 10000, 'DB session creation timed out');
        dbSessionId = db.id;
      }

      const finalId = dbSessionId || initialId;
      
      // Create partial session first so user can see it
      addSession({
        id: finalId,
        dbId: dbSessionId,
        title,
        date: new Date().toISOString(),
        courseTag,
        transcript: 'Transcribing files...',
        summary: null,
        inputType: 'upload',
        status: 'transcribing'
      });

      let combinedTranscript = '';
      const sources = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileTranscript = '';
        
        try {
          fileTranscript = await withTimeout(transcribeAudio(file), 120000, `Transcription of ${file.name} timed out`);
          combinedTranscript += (combinedTranscript ? '\n\n' : '') + `[Recording ${i + 1}: ${file.name}]\n${fileTranscript}`;
          
          sources.push({
            id: crypto.randomUUID(),
            type: 'upload' as const,
            name: file.name,
            text: fileTranscript,
            dateAdded: new Date().toISOString()
          });

          // Update incrementally
          updateSession(finalId, { 
            transcript: combinedTranscript,
            sources: sources
          });
        } catch (err: any) {
          console.error(`Failed to transcribe ${file.name}:`, err);
          combinedTranscript += (combinedTranscript ? '\n\n' : '') + `[Recording ${i + 1}: ${file.name}] - Transcription failed.`;
        }
      }

      if (userId && dbSessionId && combinedTranscript) {
        await withTimeout(saveTranscript(dbSessionId, userId, combinedTranscript), 10000, 'Final transcript save timed out');
      }

      updateSession(finalId, { 
        status: 'transcribed',
        transcript: combinedTranscript
      });

      return finalId;
    } catch (err: any) {
      console.error('Batch audio process error:', err);
      alert(`Error processing audio files: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessRecording = async (blob: Blob, sessionId: string) => {
    setIsUploading(true);
    try {
      // Convert blob to file for transcription API
      const file = new File([blob], `recording-${sessionId}.webm`, { type: blob.type });
      
      let transcript = '';
      try {
        transcript = await withTimeout(transcribeAudio(file), 90000, 'Transcription request timed out');
      } catch (err: any) {
        console.error('Final transcription failed:', err);
        // We don't want to overwrite if speech recognition got something but API failed
        return; 
      }

      if (transcript && transcript.trim()) {
        updateSession(sessionId, { 
          transcript,
          status: 'transcribed'
        });

        if (userId) {
          const session = [activeSession, ...(activeSession ? [] : [])].find(s => s?.id === sessionId);
          if (session?.dbId) {
            await saveTranscript(session.dbId, userId, transcript);
          }
        }
      }
    } catch (err: any) {
      console.error('Error processing live recording:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRecordLive = async (title: string, courseTag: string) => {
    // This is handled in App.tsx via pendingSessionMeta
    return { title, courseTag }; 
  };

  const handleRecordTab = async (title: string, courseTag: string) => {
    // This is handled in App.tsx via pendingSessionMeta
    return { title, courseTag, isTab: true };
  };

  const handleAppendAudio = async (file: File) => {
    if (!activeSession) return;
    setIsUploading(true);
    
    try {
      const transcript = await withTimeout(transcribeAudio(file), 70000, 'Transcription timed out');
      const newSource = {
        id: crypto.randomUUID(),
        type: 'upload' as const,
        name: file.name,
        text: transcript,
        dateAdded: new Date().toISOString()
      };
      
      const combinedTranscript = `${activeSession.transcript}\n\n[Added Recording: ${file.name}]\n${transcript}`;
      const updatedSources = [...(activeSession.sources || []), newSource];
      
      updateSession(activeSession.id, {
        transcript: combinedTranscript,
        sources: updatedSources
      });

      if (userId && activeSession.dbId) {
        await saveTranscript(activeSession.dbId, userId, combinedTranscript);
      }
      
      alert(`Successfully added and transcribed ${file.name}`);
    } catch (err: any) {
      alert(`Failed to add audio: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (files.length > 1) {
      await processAudioFiles(Array.from(files));
    } else {
      await processAudioFile(files[0]);
    }
    
    if (e.target) e.target.value = '';
  };

  const handleSummarize = async () => {
    if (!activeSession?.transcript) return;
    setIsSummarizing(true);
    try {
      const summary: Summary = await summarizeTranscript(activeSession.transcript, activeSession.attachments || []);
      updateSession(activeSession.id, { summary });
    } catch (err: any) {
      alert(`Summarize error: ${err.message}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateTTS = async (text: string) => {
    setIsGeneratingTTS(true);
    try {
      // Try high-quality API first if implemented later, 
      // but for now use browser's SpeechSynthesis as a reliable fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Match settings voice if possible, or pick a good default
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes(ttsVoice)) || voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = 1.0;
        utterance.onend = () => setIsGeneratingTTS(false);
        utterance.onerror = () => setIsGeneratingTTS(false);
        
        window.speechSynthesis.speak(utterance);
      } else {
        throw new Error('TTS not supported in this browser');
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      setIsGeneratingTTS(false);
    }
  };

  const handleGenerateSelectionTTS = async (selectedText: string) => {
    if (!selectedText.trim()) return;
    setIsSelectedGeneratingTTS(true);
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(selectedText);
        utterance.onend = () => setIsSelectedGeneratingTTS(false);
        utterance.onerror = () => setIsSelectedGeneratingTTS(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      setIsSelectedGeneratingTTS(false);
    }
  };

  const handleAddAttachment = async (e: React.ChangeEvent<HTMLInputElement>): Promise<boolean> => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeSession) return false;
    
    const readFilAsAttachment = (file: File) => new Promise<{id:string, name:string, data:string, mimeType:string}>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          data: base64,
          mimeType: file.type || 'application/octet-stream'
        });
      };
      reader.onerror = () => reject(new Error(`Error reading file ${file.name}`));
      reader.readAsDataURL(file);
    });

    try {
      const newAttachments = [];
      for (let i = 0; i < files.length; i++) {
        newAttachments.push(await readFilAsAttachment(files[i]));
      }
      const updatedAttachments = [...(activeSession.attachments || []), ...newAttachments];
      updateSession(activeSession.id, { attachments: updatedAttachments });
      return true;
    } catch (err: any) {
      alert(`Error adding attachments: ${err.message}`);
      return false;
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!activeSession) return;
    const updatedAttachments = (activeSession.attachments || []).filter(a => a.id !== attachmentId);
    updateSession(activeSession.id, { attachments: updatedAttachments });
  };

  // ── NotebookLM Features ───────────────────────────────────────

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [isGeneratingDataTable, setIsGeneratingDataTable] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [isAddingSource, setIsAddingSource] = useState(false);

  /** Generic helper to handle the common pattern of triggering a generation feature. */
  const generateFeature = async (
    featureName: string,
    setLoading: (val: boolean) => void,
    fetcher: (transcript: string) => Promise<any>,
    updateKey: keyof Session
  ) => {
    if (!activeSession || !activeSession.transcript) return;
    setLoading(true);
    try {
      const result = await fetcher(activeSession.transcript);
      updateSession(activeSession.id, { [updateKey]: result });
    } catch (err: any) {
      alert(`Failed to generate ${featureName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (question: string) => {
    if (!activeSession) return;
    const { askQuestion } = await import('../api/generate');
    const userMsg = { id: crypto.randomUUID(), role: 'user' as const, text: question, timestamp: new Date().toISOString() };
    const history = [...(activeSession.chatHistory || []), userMsg];
    updateSession(activeSession.id, { chatHistory: history });
    setIsChatLoading(true);
    try {
      const context = activeSession.transcript || '';
      const answer = await askQuestion(context, question);
      const assistantMsg = { id: crypto.randomUUID(), role: 'assistant' as const, text: answer, timestamp: new Date().toISOString() };
      updateSession(activeSession.id, { chatHistory: [...history, assistantMsg] });
    } catch (err: any) {
      const errMsg = { id: crypto.randomUUID(), role: 'assistant' as const, text: `Sorry, an error occurred: ${err.message}`, timestamp: new Date().toISOString() };
      updateSession(activeSession.id, { chatHistory: [...history, errMsg] });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGeneratePodcast = async () => {
    const { generatePodcastScript } = await import('../api/generate');
    await generateFeature('podcast', setIsGeneratingPodcast, generatePodcastScript, 'podcastScript');
  };

  const handleGenerateMindMap = async () => {
    const { generateMindMap } = await import('../api/generate');
    await generateFeature('mind map', setIsGeneratingMindMap, generateMindMap, 'mindMap');
  };

  const handleGenerateDataTable = async () => {
    const { generateDataTable } = await import('../api/generate');
    await generateFeature('data table', setIsGeneratingDataTable, generateDataTable, 'dataTable');
  };

  const handleGenerateSlides = async () => {
    const { generateSlides } = await import('../api/generate');
    await generateFeature('slides', setIsGeneratingSlides, generateSlides, 'slides');
  };

  const handleAddSourceUrl = async (url: string) => {
    if (!activeSession) return;
    const { fetchUrlText } = await import('../api/sources');
    setIsAddingSource(true);
    try {
      const text = await fetchUrlText(url);
      const source = { id: crypto.randomUUID(), type: 'url' as const, name: url, url, text, dateAdded: new Date().toISOString() };
      const updated = [...(activeSession.sources || []), source];
      // Append extracted text to transcript context
      const combinedTranscript = `${activeSession.transcript}\n\n[Web Source: ${url}]\n${text}`;
      updateSession(activeSession.id, { sources: updated, transcript: combinedTranscript });
      alert(`URL imported successfully: ${text.length} characters extracted.`);
    } catch (err: any) {
      alert(`Failed to import URL: ${err.message}`);
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleAddSourceYouTube = async (url: string) => {
    if (!activeSession) return;
    const { fetchYouTubeTranscript, extractYouTubeId } = await import('../api/sources');
    const videoId = extractYouTubeId(url);
    if (!videoId) { alert('Could not extract YouTube video ID from URL.'); return; }
    setIsAddingSource(true);
    try {
      const { text, isAutoGenerated } = await fetchYouTubeTranscript(videoId);
      const name = `YouTube: ${url}`;
      const note = isAutoGenerated ? '[Note: auto-generated captions — verify accuracy]' : '';
      const source = { id: crypto.randomUUID(), type: 'youtube' as const, name, url, text, dateAdded: new Date().toISOString() };
      const updated = [...(activeSession.sources || []), source];
      const combinedTranscript = `${activeSession.transcript}\n\n[YouTube Transcript${isAutoGenerated ? ' (auto-generated)' : ''}]\n${text}`;
      updateSession(activeSession.id, { sources: updated, transcript: combinedTranscript });
      alert(`YouTube transcript imported (${text.length} chars).${note}`);
    } catch (err: any) {
      alert(`Failed to import YouTube transcript: ${err.message}`);
    } finally {
      setIsAddingSource(false);
    }
  };

  return {
    isUploading,
    isSummarizing,
    isGeneratingTTS,
    isSelectedGeneratingTTS,
    ttsAudioUrl,
    selectedTtsAudioUrl,
    isChatLoading,
    isGeneratingPodcast,
    isGeneratingMindMap,
    isGeneratingDataTable,
    isGeneratingSlides,
    isAddingSource,
    processAudioFile,
    handleFileUpload,
    handleSummarize,
    handleGenerateTTS,
    handleGenerateSelectionTTS,
    handleAddAttachment,
    handleRemoveAttachment,
    handleAsk,
    handleGeneratePodcast,
    handleGenerateMindMap,
    handleGenerateDataTable,
    handleGenerateSlides,
    handleAddSourceUrl,
    handleAddSourceYouTube,
    processDocumentFiles,
    processAudioFiles,
    handleAppendAudio,
    handleProcessRecording,
    handleRecordLive,
    handleRecordTab,
  };
}
