import { supabase } from '../storage';
import { Summary } from '../../types';

export const saveTranscript = async (sessionId: string, userId: string, text: string, existingId?: string) => {
  const payload = { session_id: sessionId, user_id: userId, raw_text: text };
  if (existingId) {
    const { error } = await supabase.from('transcripts').update(payload).eq('id', existingId);
    if (error) throw error;
    return existingId;
  } else {
    const { data, error } = await supabase.from('transcripts').insert([payload]).select().single();
    if (error) throw error;
    return data.id;
  }
};

export const saveSummary = async (sessionId: string, userId: string, summary: Summary, existingId?: string) => {
  const payload = {
    session_id: sessionId,
    user_id: userId,
    tldr: summary.tldr,
    key_concepts: summary.keyConcepts,
    section_summaries: summary.detailedSummary,
    glossary: summary.glossary,
    study_questions: summary.studyQuestions
  };
  if (existingId) {
    const { error } = await supabase.from('summaries').update(payload).eq('id', existingId);
    if (error) throw error;
    return existingId;
  } else {
    const { data, error } = await supabase.from('summaries').insert([payload]).select().single();
    if (error) throw error;
    return data.id;
  }
};
