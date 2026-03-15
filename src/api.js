const DEFAULT_API_URL = 'https://api.dynaris.ai';

export async function sendMessage(apiUrl, userId, sessionId, message, apiKey, attachments = []) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;
  const body = {
    session_id: sessionId,
    message: String(message || '').trim(),
  };
  if (attachments && attachments.length > 0) {
    body.attachments = attachments.filter((a) => a.data_base64 && a.mime_type).map((a) => ({
      data_base64: a.data_base64,
      mime_type: a.mime_type,
      filename: a.filename || 'file',
    }));
  }
  const res = await fetch(`${base}/api/chat-widget/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = new Error(`Send failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchMessages(apiUrl, userId, sessionId, after = null, apiKey) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const params = new URLSearchParams({ session_id: sessionId });
  if (after) params.set('after', after);
  const headers = {};
  if (apiKey) headers['X-Api-Key'] = apiKey;
  const res = await fetch(`${base}/api/chat-widget/messages?${params}`, { headers });
  if (!res.ok) {
    const err = new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function sendTranscript(apiUrl, userId, sessionId, email, apiKey) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;
  const res = await fetch(`${base}/api/chat-widget/transcript`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
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

export function createEventSource(apiUrl, userId, sessionId, onMessage, apiKey) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const params = new URLSearchParams({ session_id: sessionId });
  if (apiKey) params.set('api_key', apiKey);
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
