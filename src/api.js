const DEFAULT_API_URL = 'https://api.dynaris.ai';

async function fetchWidget(url, init) {
  try {
    return await fetch(url, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const err = new Error(`Network error ${url}: ${msg}`);
    throw err;
  }
}

export async function sendMessage(apiUrl, userId, sessionId, message, apiKey, attachments = [], metadata = undefined) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;
  const body = {
    session_id: sessionId,
    message: String(message || '').trim(),
  };
  if (metadata && typeof metadata === 'object') {
    body.metadata = metadata;
  }
  if (attachments && attachments.length > 0) {
    body.attachments = attachments.filter((a) => a.data_base64 && a.mime_type).map((a) => ({
      data_base64: a.data_base64,
      mime_type: a.mime_type,
      filename: a.filename || 'file',
    }));
  }
  const url = `${base}/api/chat-widget/message`;
  const res = await fetchWidget(url, {
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
  const url = `${base}/api/chat-widget/messages?${params}`;
  const res = await fetchWidget(url, { headers });
  if (!res.ok) {
    const err = new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function submitWidgetContact(apiUrl, apiKey, sessionId, payload) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;
  const url = `${base}/api/chat-widget/contact`;
  const body = { session_id: sessionId };
  const optionalFields = ['first_name', 'last_name', 'phone_number', 'email', 'description'];
  for (const field of optionalFields) {
    const value = payload[field];
    if (typeof value === 'string' && value.trim() !== '') {
      body[field] = value.trim();
    }
  }
  const res = await fetchWidget(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const j = JSON.parse(text);
      if (j.detail !== undefined) {
        detail = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail);
      }
    } catch (_) {
      if (text.trim()) detail = text.trim().slice(0, 300);
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    return {};
  }
}

export async function sendTranscript(apiUrl, userId, sessionId, email, apiKey) {
  const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;
  const url = `${base}/api/chat-widget/transcript`;
  const res = await fetchWidget(url, {
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
