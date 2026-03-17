import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Summary, Attachment } from '../types';
import { getSummarizationPrompt } from '../prompts';

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export const transcribeAudio = async (file: File): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const mimeType = getAudioMimeType(file);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: 'Please transcribe this audio file accurately. Include timestamps every 30 seconds in the format [H:MM:SS].',
        },
      ],
    },
  });

  return response.text || '';
};

export const summarizeTranscript = async (transcript: string, attachments: Attachment[] = []): Promise<Summary> => {
  const parts: any[] = [
    { text: getSummarizationPrompt(transcript) }
  ];

  for (const attachment of attachments) {
    parts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.data
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: "You are an expert academic assistant. Your primary directive is to generate exceptionally long, granular, and comprehensive detailed summaries. The 'detailedSummary' section MUST read like a full textbook chapter, with multi-paragraph explanations for every single topic. Do not be concise. Expand on every nuance, example, and piece of context. If additional documents are provided, integrate their insights seamlessly into the summary.",
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tldr: { type: Type.STRING, description: 'A short summary of the lecture.' },
          keyConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key concepts discussed in the lecture.'
          },
          detailedSummary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ['topic', 'content']
            },
            description: 'A detailed summary of the lecture.'
          },
          glossary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING }
              },
              required: ['term', 'definition']
            },
            description: 'A glossary of terms used in the lecture.'
          },
          studyQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Questions and answers based on the lecture.'
          }
        },
        required: ['tldr', 'keyConcepts', 'detailedSummary', 'glossary', 'studyQuestions']
      }
    }
  });

  const text = response.text || '{}';
  return JSON.parse(text) as Summary;
};

export const generateTTS = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Failed to generate audio');
  }
  
  return `data:audio/wav;base64,${base64Audio}`;
};
