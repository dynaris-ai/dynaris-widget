const STORAGE_KEY = 'dynaris_widget_session_id';
const FINGERPRINT_STORAGE_KEY = 'dynaris_widget_screening_fingerprint';

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

export function getOrCreateScreeningFingerprint() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return crypto.randomUUID ? crypto.randomUUID() : `fp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
  let fingerprint = window.localStorage.getItem(FINGERPRINT_STORAGE_KEY);
  if (!fingerprint) {
    fingerprint = crypto.randomUUID ? crypto.randomUUID() : `fp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    window.localStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
  }
  return fingerprint;
}
