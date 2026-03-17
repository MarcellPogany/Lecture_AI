import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../types';
import { createNewRecordingSession } from '../utils/recognition';
import { ai } from '../api/gemini';
import { Modality } from '@google/genai';

interface UseRecordingOptions {
  onSessionCreate: (session: Session) => void;
  onTranscriptUpdate: (sessionId: string, transcript: string) => void;
  transcriptionLanguage: string;
}

export const useRecording = ({ onSessionCreate, onTranscriptUpdate, transcriptionLanguage }: UseRecordingOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const activeRef           = useRef(false);
  const sessionIdRef        = useRef<string | null>(null);
  const committedRef        = useRef('');
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const audioContextRef     = useRef<AudioContext | null>(null);
  const mediaStreamRef      = useRef<MediaStream | null>(null);
  const processorRef        = useRef<ScriptProcessorNode | null>(null);
  const liveSessionRef      = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sessionId = uuidv4();
      sessionIdRef.current   = sessionId;
      committedRef.current   = '';
      activeRef.current      = true;
      setInterimText('');

      onSessionCreate(createNewRecordingSession(sessionId));
      setIsRecording(true);

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            processor.onaudioprocess = (e) => {
              if (!activeRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                let s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              const buffer = new ArrayBuffer(pcm16.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < pcm16.length; i++) {
                view.setInt16(i * 2, pcm16[i], true);
              }
              
              let binary = '';
              const bytes = new Uint8Array(buffer);
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Data = btoa(binary);
              
              sessionPromise.then((session) => {
                if (activeRef.current) {
                  session.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                }
              });
            };
            source.connect(processor);
            processor.connect(audioContext.destination);
          },
          onmessage: async (message: any) => {
            if (!activeRef.current) return;
            
            const textChunk = message.serverContent?.inputTranscription?.text;
            if (textChunk) {
              committedRef.current += textChunk;
              onTranscriptUpdate(sessionIdRef.current!, committedRef.current);
            }
          },
          onclose: () => {
            console.log('Live API closed');
          },
          onerror: (err) => {
            console.error('Live API error:', err);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a passive transcription assistant. Do not speak, do not respond. Just listen and transcribe the user's speech exactly as spoken, including 'hmm', 'mmm', pauses, and stuttering. Do not correct grammar or remove filler words.",
          inputAudioTranscription: {},
        },
      });
      
      liveSessionRef.current = await sessionPromise;

    } catch (err: any) {
      alert(`Microphone error: ${err.message}. Please check browser permissions.`);
      setIsRecording(false);
    }
  }, [onSessionCreate, onTranscriptUpdate]);

  const stopRecording = useCallback(() => {
    activeRef.current = false;
    sessionIdRef.current = null;

    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
      audioContextRef.current.close();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch (e) {
        console.error('Error closing live session', e);
      }
    }

    setIsRecording(false);
    setInterimText('');
  }, []);

  return {
    isRecording, interimText, recordingTime,
    formatTime: (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`,
    startRecording, stopRecording,
  };
};
