import { callOpenRouter, cleanJsonResponse } from './openrouter';

const fileToBase64 = (file: Blob): Promise<string> => {
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

const getAudioMimeType = (blob: Blob): string => {
  return blob.type || 'audio/webm';
};

/**
 * Step 1: Transcribe a small chunk of audio (e.g., 5-10 seconds)
 * Uses Gemini 3.1 Flash-Lite, optimized for speed.
 * @param chunk The audio Blob chunk
 * @param previousContext The text of the previous chunk to help the model with continuity
 * @param language The target language (e.g., 'en-US' or '' for auto-detect)
 */
export const transcribeAudioChunk = async (
  chunk: Blob,
  previousContext: string = '',
  language: string = ''
): Promise<string> => {
  const base64Data = await fileToBase64(chunk);
  const mimeType = getAudioMimeType(chunk);

  let systemPrompt = 'Please transcribe this audio accurately.';
  if (language) {
    systemPrompt += ` The expected spoken language code is ${language}.`;
  }
  if (previousContext) {
    systemPrompt += ` For continuity, the previous transcribed sentence was: "${previousContext}". Continue transcribing the new audio naturally from there without repeating the previous context.`;
  }

  const response = await callOpenRouter({
    model: 'google/gemini-3.1-flash-lite-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: systemPrompt },
          {
            type: 'image_url', // OpenRouter multi-modal schema uses image_url for base64 data URIs
            image_url: { url: `data:${mimeType};base64,${base64Data}` }
          }
        ]
      }
    ],
    // Low temperature to prevent hallucinations during short chunk transcriptions
    temperature: 0.1,
  });

  return response.choices?.[0]?.message?.content || '';
};

/**
 * Step 2: The "Typeless" LLM Post-Processing Layer
 * Cleans the raw ASR text: fixes punctuation, removes filler words ("um," "uh"),
 * formats lists, and corrects false starts.
 */
export const cleanTranscriptChunk = async (
  rawText: string,
  previousCleanedContext: string = ''
): Promise<string> => {
  if (!rawText.trim()) return '';

  const prompt = `
You are a highly skilled professional transcription editor.
Your task is to take raw, messy speech-to-text output and clean it up to be perfectly readable, formatted, and punctuated text.

RULES:
1. Remove all filler words (e.g., "um", "uh", "you know", "like" when used as a filler).
2. Fix false starts and stutters (e.g., "I I think we should go to to the store" -> "I think we should go to the store").
3. Add proper grammatical punctuation (periods, commas, question marks).
4. Do NOT change the meaning or tone of the text. Keep the speaker's original voice.
5. If the speaker lists items, you may format it as a comma-separated list or keep it flowing naturally.
6. Do NOT invent new information. Do NOT hallucinate.
7. Return ONLY the cleaned text. Do NOT add any conversational filler like "Here is the text:".

${previousCleanedContext ? `For continuity, the PREVIOUS preceding text was:\n"${previousCleanedContext}"\n\nMake sure the new text flows logically from that.` : ''}

RAW TRANSCRIBED TEXT TO CLEAN:
"""
${rawText}
"""
  `.trim();

  const response = await callOpenRouter({
    model: 'anthropic/claude-3-5-haiku', // Fast, cheap, excellent at NLP tasks
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2, // Low temperature for high precision editing without creative rewriting
  });

  return cleanJsonResponse(response.choices?.[0]?.message?.content || '');
};
