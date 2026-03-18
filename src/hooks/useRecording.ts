import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../types';
import { getSpeechRecognition, createNewRecordingSession } from '../utils/recognition';
import { transcribeAudioChunk, cleanTranscriptChunk } from '../api/transcriptionStream';

interface UseRecordingOptions {
  onSessionCreate: (session: Session) => void;
  onTranscriptUpdate: (sessionId: string, transcript: string) => void;
  onRecordingFinish?: (blob: Blob, sessionId: string) => void;
  transcriptionLanguage: string;
}

export const useRecording = ({ onSessionCreate, onTranscriptUpdate, onRecordingFinish, transcriptionLanguage }: UseRecordingOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [processingText, setProcessingText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingSource, setRecordingSource] = useState<'mic' | 'tab' | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const finalSegmentsRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chunk processing queues
  const chunkQueueRef = useRef<Blob[]>([]);
  const isProcessingQueueRef = useRef(false);
  const rawTranscriptContextRef = useRef<string>('');
  const cleanTranscriptContextRef = useRef<string>('');

  // Music detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastSpeechTimestampRef = useRef<number>(Date.now());
  const musicDetectionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Store callbacks in refs to avoid stale closures
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  useEffect(() => { onTranscriptUpdateRef.current = onTranscriptUpdate; }, [onTranscriptUpdate]);
  const transcriptionLanguageRef = useRef(transcriptionLanguage);
  useEffect(() => { transcriptionLanguageRef.current = transcriptionLanguage; }, [transcriptionLanguage]);

  // Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, isPaused]);

  const buildTranscript = useCallback(() => {
    return finalSegmentsRef.current.join(' ').trim();
  }, []);

  const pushSegment = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !sessionIdRef.current) return;
    finalSegmentsRef.current.push(trimmed);
    onTranscriptUpdateRef.current(sessionIdRef.current, buildTranscript());
  }, [buildTranscript]);

  const processChunkQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || chunkQueueRef.current.length === 0) return;
    isProcessingQueueRef.current = true;

    try {
      while (chunkQueueRef.current.length > 0 && activeRef.current) {
        const chunk = chunkQueueRef.current.shift();
        if (!chunk) continue;

        try {
          // 1. ASR via Gemini 3.1 Flash-Lite
          const rawText = await transcribeAudioChunk(
            chunk, 
            rawTranscriptContextRef.current, 
            transcriptionLanguageRef.current ?? ''
          );
          
          if (!rawText.trim()) continue;
          
          // Context for the next chunk
          rawTranscriptContextRef.current = rawText.split(' ').slice(-10).join(' ');
          
          // Show the raw text in the UI while we wait for Haiku to clean it up
          setProcessingText(rawText);

          // 2. LLM Cleanup via Claude 3.5 Haiku
          const cleanText = await cleanTranscriptChunk(rawText, cleanTranscriptContextRef.current);
          
          if (cleanText.trim()) {
            cleanTranscriptContextRef.current = cleanText.split(' ').slice(-15).join(' ');
            setInterimText(''); // Clear the fast browser preview since we have real cloud text now
            pushSegment(cleanText);
          }
        } catch (err) {
          console.error('[Chunk Processor] Error processing chunk:', err);
        } finally {
          setProcessingText('');
        }
      }
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [pushSegment]);

  const stopAudioAnalysis = useCallback(() => {
    if (musicDetectionTimerRef.current) { clearInterval(musicDetectionTimerRef.current); musicDetectionTimerRef.current = null; }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  const startMusicDetection = useCallback(() => {
    if (musicDetectionTimerRef.current) clearInterval(musicDetectionTimerRef.current);
    musicDetectionTimerRef.current = setInterval(() => {
      if (!analyserRef.current || !activeRef.current) return;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const volume = Math.sqrt(sum / bufferLength) * 100;
      const timeSinceLastSpeech = Date.now() - lastSpeechTimestampRef.current;
      if (volume > 0.5 && timeSinceLastSpeech > 15000) {
        pushSegment('\n[Music playing... ♫]\n');
        lastSpeechTimestampRef.current = Date.now();
      }
    }, 2000);
  }, [pushSegment]);

  /**
   * Creates a NEW recognition instance and starts it.
   * We always create a fresh instance on restart to avoid InvalidStateError
   * when reusing a recognition object that has already fired 'end'.
   */
  const createAndStartRecognition = useCallback(() => {
    if (!activeRef.current) return;
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    // Destroy old instance cleanly
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // continuous=true is correct for long sessions. 
    // The difference vs continuous=false: the engine won't stop after the first silence.
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // Empty string = browser auto-detects language, handles code-switching
    recognition.lang = transcriptionLanguageRef.current ?? '';

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text.trimEnd() + ' ';
        } else {
          interim += text;
        }
      }

      // The built-in recognition is ONLY for sub-second visual preview now.
      // It is NOT used for the final permanent transcript.
      setInterimText(interim || finalText);
      
      if (finalText.trim() || interim.trim()) {
        lastSpeechTimestampRef.current = Date.now();
      }
    };

    recognition.onerror = (event: any) => {
      const ign = ['no-speech', 'aborted'];
      if (!ign.includes(event.error)) {
        console.error(`[Recognition] Error: ${event.error}`);
      }
      // For recoverable errors, do NOT explicitly restart here.
      // The 'onend' handler will fire next and trigger the restart.
    };

    recognition.onend = () => {
      if (!activeRef.current) return;
      // Use a short delay before creating a new instance to let the browser
      // fully release the previous recognition object.
      restartTimerRef.current = setTimeout(() => {
        createAndStartRecognition();
      }, 150);
    };

    try {
      recognition.start();
    } catch (e: any) {
      console.error('[Recognition] Start failed:', e.message);
      // Retry after a longer delay if start fails (e.g., browser not ready)
      restartTimerRef.current = setTimeout(() => {
        createAndStartRecognition();
      }, 500);
    }
  }, [pushSegment]);

  const startRecording = useCallback(async (options?: { isResuming?: boolean, sessionId?: string, initialTranscript?: string, sourceType?: 'mic' | 'tab' }) => {
    try {
      const isResuming = options?.isResuming || false;
      const existingSessionId = options?.sessionId;
      const initialTranscript = options?.initialTranscript || '';
      const sourceType = options?.sourceType || 'mic';
      
      let stream: MediaStream;
      
      if (sourceType === 'tab') {
        stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true });
        if (stream.getAudioTracks().length === 0) {
          stream.getTracks().forEach(t => t.stop());
          throw new Error('Tab audio was not shared. Please ensure "Share tab audio" is checked.');
        }
        stream.getVideoTracks().forEach(track => track.stop());
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // 1. Setup Audio Analysis
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      lastSpeechTimestampRef.current = Date.now();

      // 2. Setup MediaRecorder with Timeslicing
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      chunkQueueRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // Only push chunks to the live API processing queue when not paused
          if (activeRef.current) {
            chunkQueueRef.current.push(event.data);
            processChunkQueue();
          }
        }
      };
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (onRecordingFinish && sessionIdRef.current) {
          onRecordingFinish(audioBlob, sessionIdRef.current);
        }
        stream.getTracks().forEach(track => track.stop());
        stopAudioAnalysis();
      };

      // 3. Setup session state
      if (!isResuming) {
        const sessionId = existingSessionId || uuidv4();
        sessionIdRef.current = sessionId;
        finalSegmentsRef.current = initialTranscript ? [initialTranscript] : [];
        setInterimText('');
        setRecordingTime(0);
        if (!existingSessionId) {
          onSessionCreate(createNewRecordingSession(sessionId));
        }
      } else {
        finalSegmentsRef.current = initialTranscript ? [initialTranscript] : [];
      }

      activeRef.current = true;
      setRecordingSource(sourceType);
      
      // Request a chunk every 5 seconds for streaming ASR
      mediaRecorder.start(5000);

      // 4. Start recognition (mic only)
      if (sourceType === 'mic') {
        createAndStartRecognition();
      }

      startMusicDetection();
      setIsRecording(true);
      setIsPaused(false);

    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        alert(err.message || 'Error accessing audio source.');
      }
      setIsRecording(false);
      setRecordingSource(null);
      stopAudioAnalysis();
    }
  }, [onSessionCreate, onRecordingFinish, stopAudioAnalysis, pushSegment, startMusicDetection, createAndStartRecognition]);

  const pauseRecording = useCallback(() => {
    activeRef.current = false;
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause(); // Pause stops chunk generation
    }
    if (musicDetectionTimerRef.current) { clearInterval(musicDetectionTimerRef.current); musicDetectionTimerRef.current = null; }
    setIsPaused(true);
    setInterimText('');
  }, []);

  const resumeRecording = useCallback(() => {
    activeRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    lastSpeechTimestampRef.current = Date.now();
    createAndStartRecognition();
    startMusicDetection();
    setIsPaused(false);
  }, [createAndStartRecognition, startMusicDetection]);

  const stopRecording = useCallback(() => {
    activeRef.current = false;
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopAudioAnalysis();
    setIsRecording(false);
    setIsPaused(false);
    setInterimText('');
    setRecordingSource(null);
  }, [stopAudioAnalysis]);

  return {
    isRecording, isPaused, interimText, processingText, recordingTime, recordingSource,
    formatTime: (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`,
    startRecording, pauseRecording, resumeRecording, stopRecording,
  };
};
