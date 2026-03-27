class VoiceApiError extends Error {
  constructor(message, status = 0, extra = {}) {
    super(message);
    this.name = 'VoiceApiError';
    this.status = status;
    this.url = extra.url;
    this.responsePreview = extra.responsePreview;
  }
}

/** Enable with localStorage.setItem('dynaris_widget_voice_debug', '1') or window.__DYNARIS_WIDGET_VOICE_DEBUG__ = true */
export function isVoiceDebugEnabled() {
  if (typeof window !== 'undefined' && window.__DYNARIS_WIDGET_VOICE_DEBUG__ === true) {
    return true;
  }
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('dynaris_widget_voice_debug') === '1';
  } catch {
    return false;
  }
}

export function voiceDprint(tag, message) {
  const d = new Date();
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const ts = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  console.warn(`[${ts}] 🔍 [${tag}] ${message}`);
}

export function resolveVoiceApiBaseUrl(apiUrl, voiceApiUrl) {
  const raw = typeof voiceApiUrl === 'string' && voiceApiUrl.trim() ? voiceApiUrl : apiUrl;
  return String(raw || '').replace(/\/+$/, '');
}

function shortId(value) {
  const s = String(value || '');
  return s.length <= 8 ? s || '—' : `${s.slice(0, 8)}…`;
}

async function postVoiceJson(operationTag, url, apiKey, body) {
  if (!apiKey) {
    voiceDprint(`${operationTag}_AUTH`, 'missing X-Api-Key (apiKey not set)');
    throw new VoiceApiError('Voice sessions require apiKey authentication.', 401, { url });
  }

  if (isVoiceDebugEnabled()) {
    voiceDprint(
      `${operationTag}_REQUEST`,
      `url=${url} session_id=${shortId(body?.session_id)} agent_id=${shortId(body?.agent_id)}`,
    );
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    voiceDprint(`${operationTag}_NETWORK`, `fetch failed url=${url} error=${msg}`);
    throw new VoiceApiError(`Voice network error: ${msg}`, 0, { url });
  }

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { _nonJsonBody: text.slice(0, 400) };
  }

  if (!response.ok) {
    const detail =
      payload?.detail ?? payload?.message ?? `Voice API request failed with status ${response.status}`;
    const preview =
      typeof detail === 'string'
        ? detail
        : JSON.stringify(payload).slice(0, 500);
    voiceDprint(
      `${operationTag}_HTTP_ERROR`,
      `status=${response.status} statusText=${response.statusText || '—'} url=${url} body=${preview}`,
    );
    if (response.status === 404) {
      voiceDprint(
        `${operationTag}_HINT`,
        '404 usually means the gateway does not expose POST /api/chat-widget/voice/* yet, or voiceApiUrl points at the wrong host (must be the same API base as chat, e.g. https://api.dynaris.ai).',
      );
    }
    throw new VoiceApiError(String(detail), response.status, { url, responsePreview: preview });
  }

  if (isVoiceDebugEnabled()) {
    voiceDprint(`${operationTag}_OK`, `url=${url} status=${response.status}`);
  }

  return payload;
}

export async function startVoiceSession(
  apiUrl,
  apiKey,
  {
    sessionId,
    agentId,
    participantName,
    sessionDurationMinutes,
    agentName,
    metadata,
    voiceApiUrl,
  },
) {
  const baseUrl = resolveVoiceApiBaseUrl(apiUrl, voiceApiUrl);
  const url = `${baseUrl}/api/chat-widget/voice/start`;
  return postVoiceJson('VOICE_START', url, apiKey, {
    session_id: sessionId,
    agent_id: agentId,
    participant_name: participantName,
    session_duration_minutes: sessionDurationMinutes,
    agent_name: agentName,
    metadata,
  });
}

export async function closeVoiceSession(apiUrl, apiKey, { sessionId, voiceApiUrl }) {
  const baseUrl = resolveVoiceApiBaseUrl(apiUrl, voiceApiUrl);
  const url = `${baseUrl}/api/chat-widget/voice/close`;
  return postVoiceJson('VOICE_CLOSE', url, apiKey, {
    session_id: sessionId,
  });
}

export { VoiceApiError };
