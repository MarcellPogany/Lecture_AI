// ── Frontend UI types ─────────────────────────────────────
export interface Attachment {
  id: string;
  name: string;
  data: string; // base64
  mimeType: string;
}

export interface SessionSource {
  id: string;
  type: 'transcript' | 'url' | 'youtube' | 'paste' | 'file';
  name: string;
  url?: string;
  text?: string;           // extracted/full text for RAG
  dateAdded: string;
  cannotParse?: boolean;
}

export interface Session {
  id: string;        // local UUID (may equal dbId after sync)
  dbId?: string;     // Supabase sessions.id once persisted
  title: string;
  date: string;
  courseTag: string;
  transcript: string;
  transcriptDbId?: string;  // Supabase transcripts.id
  summary: Summary | null;
  summaryDbId?: string;     // Supabase summaries.id
  audioUrl?: string;        // signed URL or blob URL
  audioStoragePath?: string; // path in Supabase Storage
  inputType: 'upload' | 'record' | 'paste' | 'url';
  status: 'pending' | 'transcribed' | 'summarized' | 'error';
  attachments?: Attachment[];
  sources?: SessionSource[];
  chatHistory?: ChatMessage[];
  podcastScript?: PodcastTurn[];
  mindMap?: MindMapNode;
  dataTable?: { headers: string[]; rows: string[][] };
  slides?: Slide[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface PodcastTurn {
  host: 'A' | 'B';
  text: string;
}

export interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

export interface Slide {
  title: string;
  bullets: string[];
  speakerNote?: string;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  semester?: string;
  professor?: string;
  createdAt: string;
}

export interface SourceInfo {
  type: 'transcript' | 'document' | 'error';
  name: string;
  meta?: string; // e.g. "42 mins" or "18 pages"
  date?: string;
  cannotParse?: boolean;
}

export interface DetailedBlock {
  heading: string;
  sources: string;
  body: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'recall' | 'comprehension' | 'application';
}

export interface Summary {
  // Legacy fields kept for backwards compat
  tldr: string;
  keyConcepts: string[];
  detailedSummary: { topic: string; content: string }[];
  glossary: { term: string; definition: string }[];
  studyQuestions: string[];
  actionItems?: { speaker: string; task: string }[];

  // New rich fields
  sources?: SourceInfo[];
  introductionParagraph?: string;
  topicBlocks?: DetailedBlock[];
  synthesisParagraph?: string;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
}

// ── Auth types ────────────────────────────────────────────
export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  plan_tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

// ── Database row types (mirror the SQL schema) ────────────
export interface DbSession {
  id: string;
  user_id: string;
  course_id?: string | null;
  title: string;
  course_tag: string;
  input_type: 'upload' | 'record' | 'paste' | 'url';
  duration_seconds?: number | null;
  language: string;
  summary_depth: 'brief' | 'standard' | 'comprehensive';
  status: 'pending' | 'transcribed' | 'summarized' | 'error';
  created_at: string;
  updated_at: string;
}

export interface DbTranscript {
  id: string;
  session_id: string;
  user_id: string;
  raw_text: string;
  edited_text?: string | null;
  word_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbSummary {
  id: string;
  session_id: string;
  user_id: string;
  tldr?: string | null;
  key_concepts: string[];
  section_summaries: { topic: string; content: string }[];
  glossary: { term: string; definition: string }[];
  study_questions: string[];
  action_items: { speaker: string; task: string }[];
  created_at: string;
}

export interface DbAudioFile {
  id: string;
  session_id: string;
  user_id: string;
  storage_path: string;
  file_type: 'original' | 'tts_export';
  mime_type: string;
  size_bytes?: number | null;
  created_at: string;
}
