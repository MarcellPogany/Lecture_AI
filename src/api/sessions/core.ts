import { supabase } from '../storage';
import { Session, Summary } from '../../types';

export const fetchSessions = async (userId: string): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      transcripts (id, raw_text),
      summaries (id, tldr, key_concepts, section_summaries, glossary, study_questions, action_items),
      audio_files (storage_path)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(s => ({
    id: s.id,
    dbId: s.id,
    title: s.title,
    date: s.created_at,
    courseTag: s.course_tag,
    inputType: s.input_type,
    status: s.status,
    transcript: s.transcripts?.[0]?.raw_text || '',
    transcriptDbId: s.transcripts?.[0]?.id,
    summaryDbId: s.summaries?.[0]?.id,
    audioStoragePath: s.audio_files?.[0]?.storage_path,
    summary: s.summaries?.[0] ? {
      tldr: s.summaries[0].tldr,
      keyConcepts: s.summaries[0].key_concepts,
      detailedSummary: s.summaries[0].section_summaries,
      glossary: s.summaries[0].glossary,
      studyQuestions: s.summaries[0].study_questions
    } : null
  }));
};

export const createDbSession = async (userId: string, title: string, courseTag: string, inputType: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([{ user_id: userId, title, course_tag: courseTag, input_type: inputType }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateDbSession = async (id: string, updates: any) => {
  const { error } = await supabase.from('sessions').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteDbSession = async (id: string) => {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) throw error;
};
