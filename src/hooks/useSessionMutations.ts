import React, { useCallback, useRef } from 'react';
import { Session, Summary } from '../types';
import { createDbSession, updateDbSession, deleteDbSession, saveTranscript, saveSummary } from '../api/sessions';
import { deleteAudio } from '../api/storage';

const DEBOUNCE_MS = 1000;

export const useSessionMutations = (
  userId: string | null,
  sessions: Session[],
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  setActiveSessionId: (id: string | null) => void
) => {
  const transcriptSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addSession = useCallback(async (partial: any) => {
    if (!userId) {
      setSessions(prev => [{ ...partial, status: 'pending' } as Session, ...prev]);
      setActiveSessionId(partial.id);
      return;
    }
    try {
      if (partial.dbId) {
        setSessions(prev => [{ ...partial, status: 'pending' } as Session, ...prev]);
        setActiveSessionId(partial.dbId);
        return;
      }
      const db = await createDbSession(userId, partial.title, partial.courseTag, partial.inputType);
      const full: Session = { ...partial, dbId: db.id, id: db.id, status: 'pending' };
      setSessions(prev => [full, ...prev]);
      setActiveSessionId(db.id);
    } catch (e) { console.error(e); }
  }, [userId, setSessions, setActiveSessionId]);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const session = sessions.find(s => s.id === id);
    if (!session?.dbId || !userId) return;

    const dbFields: any = {};
    if (updates.title) dbFields.title = updates.title;
    if (updates.courseTag) dbFields.course_tag = updates.courseTag;
    if (updates.status) dbFields.status = updates.status;
    if (Object.keys(dbFields).length) updateDbSession(session.dbId, dbFields).catch(console.error);

    if (updates.transcript !== undefined) {
      if (transcriptSaveTimer.current) clearTimeout(transcriptSaveTimer.current);
      transcriptSaveTimer.current = setTimeout(async () => {
        const txId = await saveTranscript(session.dbId!, userId, updates.transcript!, session.transcriptDbId);
        setSessions(prev => prev.map(s => s.id === id ? { ...s, transcriptDbId: txId } : s));
      }, DEBOUNCE_MS);
    }

    if (updates.summary) {
      saveSummary(session.dbId, userId, updates.summary, session.summaryDbId)
        .then(sid => setSessions(prev => prev.map(s => s.id === id ? { ...s, summaryDbId: sid } : s)));
    }
  }, [userId, sessions, setSessions]);

  const deleteSession = useCallback(async (id: string) => {
    const session = sessions.find(s => s.id === id);
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      return next;
    });
    if (session?.dbId) {
      deleteDbSession(session.dbId).catch(console.error);
      if (session.audioStoragePath) deleteAudio(session.audioStoragePath).catch(console.error);
    }
  }, [sessions, setSessions]);

  return { addSession, updateSession, deleteSession };
};
