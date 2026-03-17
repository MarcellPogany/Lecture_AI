import { Summary } from '../types';
import { getSummarizationPrompt } from '../prompts';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const HEADERS_JSON = {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'HTTP-Referer': 'https://lecture-ai.local',
  'X-Title': 'LectureAI',
  'Content-Type': 'application/json',
};

const HEADERS_FORM = {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'HTTP-Referer': 'https://lecture-ai.local',
  'X-Title': 'LectureAI',
  // Content-Type intentionally omitted — browser sets multipart boundary automatically
};

export const callOpenRouter = async (payload: object): Promise<any> => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: HEADERS_JSON,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API request failed');
  }

  return response.json();
};

/** Map file extension → MIME type that Whisper accepts. */
const getAudioMimeType = (file: File): string => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    'm4a':  'audio/mp4',
    'mp4':  'audio/mp4',
    'mp3':  'audio/mpeg',
    'wav':  'audio/wav',
    'ogg':  'audio/ogg',
    'webm': 'audio/webm',
    'flac': 'audio/flac',
    'aac':  'audio/aac',
  };
  return map[ext] ?? file.type ?? 'audio/mpeg';
};

/** Transcribe an audio file (m4a, mp3, wav, ogg, webm, flac) via Whisper. */
export const transcribeAudio = async (file: File): Promise<string> => {
  const mimeType = getAudioMimeType(file);
  // Re-wrap the file with the normalized MIME type so the API accepts it
  const normalizedFile = new File([file], file.name, { type: mimeType });

  const formData = new FormData();
  formData.append('file', normalizedFile, file.name);
  formData.append('model', 'openai/whisper-large-v3');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'segment');

  const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
    method: 'POST',
    headers: HEADERS_FORM,
    body: formData,
  });

  if (!response.ok) {
    let errMsg = `Transcription failed (${response.status})`;
    try { const err = await response.json(); errMsg = err.error?.message || errMsg; } catch {}
    throw new Error(errMsg);
  }

  const result = await response.json();

  // Build transcript with [H:MM:SS] markers every 30 s from verbose_json segments
  if (result.segments && Array.isArray(result.segments)) {
    let transcript = '';
    let lastTimestamp = -30;
    for (const seg of result.segments) {
      const startSec = Math.floor(seg.start ?? 0);
      if (startSec - lastTimestamp >= 30) {
        const h = Math.floor(startSec / 3600);
        const m = Math.floor((startSec % 3600) / 60);
        const s = startSec % 60;
        transcript += `[${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}] `;
        lastTimestamp = startSec;
      }
      transcript += (seg.text ?? '').trimStart();
    }
    return transcript.trim();
  }

  return (result.text ?? '').trim();
};

/** Summarize a transcript using Claude. Returns parsed Summary or throws. */
export const summarizeTranscript = async (transcript: string): Promise<Summary> => {
  const response = await callOpenRouter({
    model: 'anthropic/claude-haiku-4.5',
    messages: [{ role: 'user', content: getSummarizationPrompt(transcript) }],
    response_format: { type: 'json_object' },
  });

  const text = response.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text) as Summary;
};
