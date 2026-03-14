const DEFAULT_API_URL = 'https://api.dynaris.ai';

export async function sendMessage(apiUrl, userId, sessionId, message) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const res = await fetch(`${base}/api/chat-widget/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      message: String(message).trim(),
    }),
  });
  if (!res.ok) {
    const err = new Error(`Send failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchMessages(apiUrl, userId, sessionId, after = null) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const params = new URLSearchParams({ user_id: userId, session_id: sessionId });
  if (after) params.set('after', after);
  const res = await fetch(`${base}/api/chat-widget/messages?${params}`);
  if (!res.ok) {
    const err = new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function sendTranscript(apiUrl, userId, sessionId, email) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const res = await fetch(`${base}/api/chat-widget/transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      email: String(email).trim(),
    }),
  });
  if (!res.ok) {
    const err = new Error(`Transcript failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function createEventSource(apiUrl, userId, sessionId, onMessage) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const params = new URLSearchParams({ user_id: userId, session_id: sessionId });
  const url = `${base}/api/chat-widget/sse?${params}`;
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'chat_new_message' && data.data?.message) {
        onMessage(data.data.message);
      }
    } catch (_) {}
  };
  es.onerror = () => {};
  return es;
}
