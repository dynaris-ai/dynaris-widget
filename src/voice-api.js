class VoiceApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'VoiceApiError';
    this.status = status;
  }
}

function resolveVoiceApiBaseUrl(apiUrl, voiceApiUrl) {
  const raw = typeof voiceApiUrl === 'string' && voiceApiUrl.trim() ? voiceApiUrl : apiUrl;
  return String(raw || '').replace(/\/+$/, '');
}

async function postVoiceJson(url, apiKey, body) {
  if (!apiKey) {
    throw new VoiceApiError('Voice sessions require apiKey authentication.', 401);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (_) {}

  if (!response.ok) {
    const detail =
      payload?.detail || payload?.message || `Voice API request failed with status ${response.status}`;
    throw new VoiceApiError(String(detail), response.status);
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
    voiceApiUrl,
  },
) {
  const baseUrl = resolveVoiceApiBaseUrl(apiUrl, voiceApiUrl);
  return postVoiceJson(`${baseUrl}/api/chat-widget/voice/start`, apiKey, {
    session_id: sessionId,
    agent_id: agentId,
    participant_name: participantName,
    session_duration_minutes: sessionDurationMinutes,
    agent_name: agentName,
  });
}

export async function closeVoiceSession(apiUrl, apiKey, { sessionId, voiceApiUrl }) {
  const baseUrl = resolveVoiceApiBaseUrl(apiUrl, voiceApiUrl);
  return postVoiceJson(`${baseUrl}/api/chat-widget/voice/close`, apiKey, {
    session_id: sessionId,
  });
}

export { VoiceApiError };
