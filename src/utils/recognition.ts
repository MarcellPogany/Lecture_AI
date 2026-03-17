import { format } from 'date-fns';
import { Session } from '../types';

export const getSpeechRecognition = () => {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

export const createNewRecordingSession = (id: string): Session => ({
  id,
  title: `Live Lecture — ${format(new Date(), 'h:mm a')}`,
  date: new Date().toISOString(),
  courseTag: 'Live',
  transcript: '',
  summary: null,
  inputType: 'record',
  status: 'pending'
});

export interface RecognitionHandlers {
  onResult: (interim: string, final: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export const setupRecognition = (recognition: any, handlers: RecognitionHandlers) => {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let interim = '';
    let newFinal = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        newFinal += text.trimEnd() + ' ';
      } else {
        interim += text;
      }
    }
    handlers.onResult(interim, newFinal);
  };

  recognition.onerror = (event: any) => handlers.onError(event.error);
  recognition.onend = () => handlers.onEnd();
};
