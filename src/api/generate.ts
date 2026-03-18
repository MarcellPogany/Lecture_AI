import { PodcastTurn, MindMapNode, Slide } from '../types';
import { callOpenRouter, cleanJsonResponse } from './openrouter';
import { getPodcastPrompt, getMindMapPrompt, getDataTablePrompt, getSlidesPrompt, getChatPrompt } from '../prompts';

/** Generic helper for JSON-based generations. */
const generateJSON = async <T>(prompt: string, model: string = 'anthropic/claude-3-5-haiku', maxTokens: number = 2000): Promise<T> => {
  const response = await callOpenRouter({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: maxTokens,
  });
  const text = cleanJsonResponse(response.choices?.[0]?.message?.content || '{}');
  return JSON.parse(text);
};

/** Generate a two-host podcast script from a transcript. */
export const generatePodcastScript = async (transcript: string): Promise<PodcastTurn[]> => {
  const parsed: any = await generateJSON(getPodcastPrompt(transcript), 'anthropic/claude-3-5-haiku', 4000);
  return Array.isArray(parsed) ? parsed : (parsed.script || parsed.dialogue || parsed.turns || []);
};

/** Generate a hierarchical mind map from a transcript. */
export const generateMindMap = async (transcript: string): Promise<MindMapNode> => {
  return generateJSON<MindMapNode>(getMindMapPrompt(transcript));
};

/** Generate a structured data table from a transcript. */
export const generateDataTable = async (transcript: string): Promise<{ headers: string[]; rows: string[][] }> => {
  return generateJSON(getDataTablePrompt(transcript));
};

/** Generate a slide deck from a transcript. */
export const generateSlides = async (transcript: string): Promise<Slide[]> => {
  const parsed: any = await generateJSON(getSlidesPrompt(transcript), 'anthropic/claude-3-5-haiku', 3000);
  return Array.isArray(parsed) ? parsed : (parsed.slides || []);
};

/** Ask a grounded question against the session's source materials. */
export const askQuestion = async (context: string, question: string): Promise<string> => {
  const response = await callOpenRouter({
    model: 'google/gemini-3.1-flash-lite-preview',
    messages: [{ role: 'user', content: getChatPrompt(context, question) }],
    max_tokens: 1500,
  });
  return response.choices?.[0]?.message?.content || 'No answer returned.';
};
