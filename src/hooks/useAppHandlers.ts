import React, { useState } from 'react';
import { Summary, Session } from '../types';
import { transcribeAudio, summarizeTranscript, generateTTS } from '../api/gemini';
import { uploadAudio, getSignedUrl } from '../api/storage';
import { createDbSession, saveTranscript } from '../api/sessions';

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      let dbSessionId: string | undefined;
      const title = file.name.replace(/\.[^/.]+$/, '');
      if (userId) {
        const db = await createDbSession(userId, title, 'Uncategorized', 'upload');
        dbSessionId = db.id;
      }

      let audioUrl: string | undefined;
      let audioStoragePath: string | undefined;
      if (userId && dbSessionId) {
        const { storagePath } = await uploadAudio(file, userId, dbSessionId);
        audioStoragePath = storagePath;
        audioUrl = await getSignedUrl(storagePath);
      } else {
        audioUrl = URL.createObjectURL(file);
      }

      const transcript = await transcribeAudio(file);

      if (userId && dbSessionId) {
        await saveTranscript(dbSessionId, userId, transcript);
      }

      addSession({
        id: dbSessionId ?? crypto.randomUUID(),
        dbId: dbSessionId,
        title,
        date: new Date().toISOString(),
        courseTag: 'Uncategorized',
        transcript,
        summary: null,
        audioUrl,
        audioStoragePath,
        inputType: 'upload',
      });
    } catch (err: any) {
      console.error('File Upload/Process error:', err);
      const msg = err.message || 'Unknown error';
      alert(`Process error: ${msg}\n\nCheck console for details.`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
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
      const audioUrl = await generateTTS(text, ttsVoice);
      setTtsAudioUrl(audioUrl);
    } catch (err: any) {
      alert(`TTS error: ${err.message}`);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleGenerateSelectionTTS = async (selectedText: string) => {
    if (!selectedText.trim()) return;
    setIsSelectedGeneratingTTS(true);
    try {
      const audioUrl = await generateTTS(selectedText, ttsVoice);
      setSelectedTtsAudioUrl(audioUrl);
    } catch (err: any) {
      alert(`TTS error: ${err.message}`);
    } finally {
      setIsSelectedGeneratingTTS(false);
    }
  };

  const handleAddAttachment = async (e: React.ChangeEvent<HTMLInputElement>): Promise<boolean> => {
    const file = e.target.files?.[0];
    if (!file || !activeSession) return false;
    
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          const newAttachment = {
            id: crypto.randomUUID(),
            name: file.name,
            data: base64,
            mimeType: file.type || 'application/octet-stream'
          };
          const updatedAttachments = [...(activeSession.attachments || []), newAttachment];
          updateSession(activeSession.id, { attachments: updatedAttachments });
          resolve(true);
        };
        reader.onerror = () => {
          alert('Error reading file');
          resolve(false);
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        alert(`Error adding attachment: ${err.message}`);
        resolve(false);
      } finally {
        if (e.target) e.target.value = '';
      }
    });
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!activeSession) return;
    const updatedAttachments = (activeSession.attachments || []).filter(a => a.id !== attachmentId);
    updateSession(activeSession.id, { attachments: updatedAttachments });
  };

  return {
    isUploading,
    isSummarizing,
    isGeneratingTTS,
    isSelectedGeneratingTTS,
    ttsAudioUrl,
    selectedTtsAudioUrl,
    handleFileUpload,
    handleSummarize,
    handleGenerateTTS,
    handleGenerateSelectionTTS,
    handleAddAttachment,
    handleRemoveAttachment,
  };
}
