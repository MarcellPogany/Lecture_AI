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
      // Optimistic update: Add local session immediately so transcript updates have a target
      setSessions(prev => [{ ...partial, status: 'pending' } as Session, ...prev]);
      setActiveSessionId(partial.id);

      const db = await createDbSession(userId, partial.title, partial.courseTag, partial.inputType);
      
      // Update the optimistic session with the real dbId, but KEEP the local id!
      setSessions(prev => prev.map(s => s.id === partial.id ? { ...s, dbId: db.id } : s));
    } catch (e) { console.error(e); }
  }, [userId, setSessions, setActiveSessionId]);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions(prev => {
      const updatedSessions = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      const session = updatedSessions.find(s => s.id === id);
      
      if (session?.dbId && userId) {
        const dbFields: any = {};
        if (updates.title) dbFields.title = updates.title;
        if (updates.courseTag !== undefined) dbFields.course_tag = updates.courseTag;
        if (updates.status) dbFields.status = updates.status;
        
        if (Object.keys(dbFields).length) {
          updateDbSession(session.dbId, dbFields).catch(console.error);
        }

        if (updates.transcript !== undefined) {
          if (transcriptSaveTimer.current) clearTimeout(transcriptSaveTimer.current);
          transcriptSaveTimer.current = setTimeout(async () => {
            // Need to get the latest transcriptDbId from the state at time of save
            // But for now we just use what we have in the local 'session' object
            const txId = await saveTranscript(session.dbId!, userId, updates.transcript!, session.transcriptDbId);
            setSessions(p => p.map(s => s.id === id ? { ...s, transcriptDbId: txId } : s));
          }, DEBOUNCE_MS);
        }

        if (updates.summary) {
          saveSummary(session.dbId, userId, updates.summary, session.summaryDbId)
            .then(sid => setSessions(p => p.map(s => s.id === id ? { ...s, summaryDbId: sid } : s)));
        }
      }

      return updatedSessions;
    });
  }, [userId, setSessions]);

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
