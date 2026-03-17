// ── Frontend UI types ─────────────────────────────────────
export interface Attachment {
  id: string;
  name: string;
  data: string; // base64
  mimeType: string;
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
}

export interface Summary {
  tldr: string;
  keyConcepts: string[];
  detailedSummary: { topic: string; content: string }[];
  glossary: { term: string; definition: string }[];
  studyQuestions: string[];
  actionItems?: { speaker: string; task: string }[];
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
