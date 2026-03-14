const STORAGE_KEY = 'dynaris_widget_session_id';

export function getOrCreateSessionId() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return crypto.randomUUID ? crypto.randomUUID() : `w-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
  let sessionId = window.localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : `w-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    window.localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}
