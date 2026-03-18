// ── Transcription prompt ──────────────────────────────────────────────────────

export const TRANSCRIPTION_PROMPT = `You are a professional transcription engine operating inside a lecture and meeting recording application. Your sole responsibility is to convert incoming audio into accurate, continuous, verbatim text.

Behavior rules:
- Transcribe every word exactly as spoken. Do not paraphrase, clean up grammar, or omit filler words (uh, um, like, you know)
- Preserve false starts and self-corrections
- Never summarize, compress, or skip ahead, regardless of repetition or silence
- If audio is inaudible or corrupted, insert [inaudible] and continue
- Mark speaker transitions with [Speaker change]
- Detect the spoken language automatically and transcribe in that language

Output format:
Return plain text. No metadata, no headers, no commentary.`;

// ── AI Summary prompt ─────────────────────────────────────────────────────────

export const getSummarizationPrompt = (transcript: string, attachmentNames: string[]) => {
  const sourceList = attachmentNames.length > 0
    ? attachmentNames.map(n => `- Uploaded document: ${n}`).join('\n')
    : '- No additional documents uploaded';

  return `You are the AI Summary engine for LectureAI. Analyze ALL materials and produce a rich, unified study output.

Source materials:
- Audio transcript (below)
${sourceList}

TRANSCRIPT:
${transcript}

Respond ONLY with a single valid JSON object. No markdown fences. Schema:

{
  "sources": [{ "type": "transcript", "name": "Audio Transcript", "meta": "Estimated duration", "cannotParse": false }],
  "tldr": "3-5 sentence overview in formal academic English",
  "introductionParagraph": "Full orienting paragraph, minimum 150 words, formal prose, no bullets",
  "topicBlocks": [
    { "heading": "Concise heading", "sources": "Transcript", "body": "Minimum 6-10 full academic sentences. Define terms. Explain relationships. Never compress. Never use bullet points." }
  ],
  "synthesisParagraph": "Closing paragraph minimum 120 words connecting all topics",
  "keyConcepts": ["at least 8 concepts"],
  "detailedSummary": [{ "topic": "Name", "content": "Full prose minimum 200 words" }],
  "glossary": [{ "term": "Term", "definition": "Full sentence definition" }],
  "studyQuestions": ["at least 5 questions"],
  "flashcards": [{ "front": "Term or question", "back": "Full sentence answer, never a single word" }],
  "quiz": [{ "question": "Full question", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "One sentence why correct", "difficulty": "recall" }]
}

CRITICAL:
1. topicBlocks: minimum 6 blocks, each body minimum 6 full sentences
2. flashcards: 20-30 cards
3. quiz: exactly 15 questions - 5 recall, 5 comprehension, 5 application
4. No bullet points inside topicBlocks body
5. Respond with ONLY the JSON object`;
};

// ── Chat prompt ───────────────────────────────────────────────────────────────

export const getChatPrompt = (context: string, question: string) => {
  return `You are a helpful academic assistant answering questions grounded in lecture materials.

SOURCE MATERIALS:
${context.substring(0, 12000)}

Answer the question using ONLY information from the source materials. If the answer is not in the materials, say so clearly. Be concise but thorough.

Question: ${question}`;
};

// ── Podcast prompt ────────────────────────────────────────────────────────────

export const getPodcastPrompt = (transcript: string) => {
  return `You are a podcast script writer. Create an engaging two-host dialogue based on this lecture transcript. Hosts: Alex (A) and Sam (B). They explain concepts conversationally and make content accessible. Target 1400-1800 words total.

Transcript:
${transcript.substring(0, 10000)}

Respond ONLY with a JSON array (no markdown fences):
[{ "host": "A", "text": "..." }, { "host": "B", "text": "..." }]

Minimum 22 turns. Alternate A and B strictly.`;
};

// ── Mind map prompt ───────────────────────────────────────────────────────────

export const getMindMapPrompt = (transcript: string) => {
  return `Extract key concepts from this lecture as a hierarchical mind map. Root = main topic.

Transcript:
${transcript.substring(0, 8000)}

Respond ONLY with JSON (no markdown fences):
{ "label": "Central Topic", "children": [{ "label": "Sub-theme", "children": [{ "label": "Concept" }] }] }

Minimum 4 branches, 3 leaves each.`;
};

// ── Data table prompt ─────────────────────────────────────────────────────────

export const getDataTablePrompt = (transcript: string) => {
  return `Extract structured comparable data from this lecture as a table (dates, stats, definitions, comparisons).

Transcript:
${transcript.substring(0, 8000)}

Respond ONLY with JSON (no markdown fences):
{ "headers": ["Col1","Col2","Col3"], "rows": [["val","val","val"]] }

Minimum 5 rows and 3 columns.`;
};

// ── Slides prompt ─────────────────────────────────────────────────────────────

export const getSlidesPrompt = (transcript: string) => {
  return `Create a 12-slide presentation from this lecture for a university class. Each slide: concise title, 4-6 bullet points, brief speaker note.

Transcript:
${transcript.substring(0, 10000)}

Respond ONLY with a JSON array (no markdown fences):
[{ "title": "Title", "bullets": ["Point 1", "Point 2"], "speakerNote": "..." }]

First slide: title slide. Last slide: Summary and Q&A.`;
};
