import { useState, useEffect } from 'react';
import { Session } from '../types';
import { fetchSessions } from '../api/sessions';

export const useSessionLoader = (userId: string | null) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setSessions([]); setActiveSessionId(null); return; }
    setIsLoading(true);
    fetchSessions(userId)
      .then(loaded => {
        setSessions(loaded);
        if (loaded.length > 0) setActiveSessionId(loaded[0].id);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { sessions, setSessions, isLoading, activeSessionId, setActiveSessionId };
};
