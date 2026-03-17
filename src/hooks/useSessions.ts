import { useSessionLoader } from './useSessionLoader';
import { useSessionMutations } from './useSessionMutations';

export const useSessions = (userId: string | null) => {
  const {
    sessions, setSessions, isLoading, activeSessionId, setActiveSessionId
  } = useSessionLoader(userId);

  const {
    addSession, updateSession, deleteSession
  } = useSessionMutations(userId, sessions, setSessions, setActiveSessionId);

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;

  return {
    sessions,
    activeSession,
    activeSessionId,
    isLoading,
    setActiveSessionId,
    addSession,
    updateSession,
    deleteSession,
  };
};
