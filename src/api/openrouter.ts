import { Summary, Attachment } from '../types';
import { getSummarizationPrompt } from '../prompts';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const HEADERS_JSON = {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'HTTP-Referer': 'https://lecture-ai.local',
  'X-Title': 'LectureAI',
  'Content-Type': 'application/json',
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/** Sanitize dynamic JSON responses by stripping markdown code fences. */
export const cleanJsonResponse = (text: string): string => {
  if (text.includes('```')) {
    return text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
  }
  return text.trim();
};

export const callOpenRouter = async (payload: object): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `OpenRouter API request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('OpenRouter API request timed out after 60 seconds.');
    }
    throw err;
  }
};

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

/** Transcribe an audio file via Gemini 3.1 Flash Lite through OpenRouter multimodal chat completion. */
export const transcribeAudio = async (file: File): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const mimeType = getAudioMimeType(file);

  const response = await callOpenRouter({
    model: 'google/gemini-3.1-flash-lite-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please transcribe this audio file accurately.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`
            }
          }
        ]
      }
    ]
  });

  return response.choices?.[0]?.message?.content || '';
};

/** Summarize a transcript using Claude. Returns parsed Summary or throws. */
export const summarizeTranscript = async (transcript: string, attachments: Attachment[] = []): Promise<Summary> => {
  const attachmentNames = attachments.map(a => a.name);
  const content: any[] = [{ type: 'text', text: getSummarizationPrompt(transcript, attachmentNames) }];
  
  // Include attachment data for documents the model can read
  for (const attachment of attachments) {
    if (attachment.mimeType.startsWith('image/') || attachment.mimeType === 'application/pdf') {
      content.push({
        type: 'image_url',
        image_url: { url: `data:${attachment.mimeType};base64,${attachment.data}` }
      });
    }
  }

  const response = await callOpenRouter({
    model: 'anthropic/claude-3-5-haiku',
    messages: [{ role: 'user', content }],
    response_format: { type: 'json_object' },
    max_tokens: 8000,
  });

  let text = response.choices?.[0]?.message?.content || '{}';
  text = cleanJsonResponse(text);
  
  try {
    return JSON.parse(text) as Summary;
  } catch (e) {
    console.error('Failed to parse summary JSON:', text.substring(0, 500));
    throw new Error('AI returned an invalid response format. Please try again.');
  }
};

/** OpenRouter does not support TTS natively, we could fallback or throw. */
export const generateTTS = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  throw new Error('TTS is not supported through OpenRouter yet. Please use the Google API directly for TTS.');
};
