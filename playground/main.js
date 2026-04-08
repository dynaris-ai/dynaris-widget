import { init } from '../src/widget.js';

/** Lets the launcher mount with no env; API calls may 401 until you set a real key or userId. */
const PLAYGROUND_PLACEHOLDER_USER_ID = 'dynaris-playground-local';

function queryParam(name) {
  const v = new URLSearchParams(window.location.search).get(name);
  return v === null || v === '' ? undefined : v;
}

function envString(key) {
  const v = import.meta.env[key];
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

function pick(first, second) {
  return first !== undefined ? first : second;
}

const apiKey = pick(queryParam('apiKey'), envString('VITE_CHAT_WIDGET_API_KEY'));
const userIdFromEnv = pick(queryParam('userId'), envString('VITE_CHAT_WIDGET_USER_ID'));
const apiUrl = pick(queryParam('apiUrl'), envString('VITE_CHAT_WIDGET_API_URL'));
const voiceAgentId = pick(
  queryParam('voiceAgentId'),
  envString('VITE_CHAT_WIDGET_VOICE_AGENT_ID'),
);
const voiceParticipantName = pick(
  queryParam('voiceParticipantName'),
  envString('VITE_CHAT_WIDGET_VOICE_PARTICIPANT_NAME'),
);
const voiceAgentName = pick(
  queryParam('voiceAgentName'),
  envString('VITE_CHAT_WIDGET_VOICE_AGENT_NAME'),
);
const voiceApiUrl = pick(
  queryParam('voiceApiUrl'),
  envString('VITE_CHAT_WIDGET_VOICE_API_URL'),
);
const title = pick(queryParam('title'), envString('VITE_WIDGET_TITLE'));
const subtitle = pick(queryParam('subtitle'), envString('VITE_WIDGET_SUBTITLE'));
const voiceEnabled = true;
const voicePreviewConfigured = Boolean(apiKey) && !voiceAgentId;

const usingPlaceholderUser = !apiKey && !userIdFromEnv;
const userId = userIdFromEnv ?? (usingPlaceholderUser ? PLAYGROUND_PLACEHOLDER_USER_ID : undefined);

const statusEl = document.getElementById('config-status');
const dlEl = document.getElementById('config-dl');

function setStatus(kind, message) {
  statusEl.textContent = message;
  statusEl.className = `mock-status mock-${kind}`;
}

function addRow(label, value) {
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = value === undefined || value === '' ? '—' : String(value);
  dlEl.appendChild(dt);
  dlEl.appendChild(dd);
}

if (usingPlaceholderUser) {
  setStatus(
    'warn',
    'Launcher visible with placeholder userId. Voice icon renders for UI testing; add apiKey and voiceAgentId for a real browser voice session.',
  );
} else if (voicePreviewConfigured) {
  setStatus(
    'ok',
    'Widget mounted with preview voice state. Add voiceAgentId to enable real browser voice start.',
  );
} else {
  setStatus('ok', 'Widget mounted with the following config (query overrides .env).');
}

addRow('apiKey', apiKey ? '••••' + String(apiKey).slice(-4) : undefined);
addRow('userId', userId);
addRow('apiUrl', apiUrl ?? '(default)');
addRow('voiceEnabled', voiceEnabled ? 'true' : 'false');
addRow('voicePreviewConfigured', voicePreviewConfigured ? 'true' : 'false');
addRow('voiceAgentId', voiceAgentId);
addRow('voiceParticipantName', voiceParticipantName);
addRow('voiceAgentName', voiceAgentName);
addRow('voiceApiUrl', voiceApiUrl);
addRow('title', title);
addRow('subtitle', subtitle);

const ctrl = init({
  apiKey,
  userId,
  apiUrl,
  voiceEnabled,
  launcherHintChat: "Let's have a chat",
  launcherHintVoice: 'Talk with us',
  voiceCallLabel: 'Talk to our voice AI',
  ...(voiceAgentId ? { voiceAgentId } : {}),
  ...(voiceParticipantName ? { voiceParticipantName } : {}),
  ...(voiceAgentName ? { voiceAgentName } : {}),
  ...(voiceApiUrl ? { voiceApiUrl } : {}),
  title: title ?? 'Playground chat',
  subtitle: subtitle ?? 'Local dynaris-widget',
  usePolling: true,
  welcomeMessage: usingPlaceholderUser
    ? '**Playground** — set `VITE_CHAT_WIDGET_API_KEY` in `.env` or `.env.local` at the repo root to hit the real API.'
    : '**Playground** — messages go to the real API when `apiKey` is valid.',
  privacyPolicyUrl: 'https://dynaris.ai/privacy',
});

if (!ctrl) {
  setStatus('err', 'init() returned null (unexpected).');
} else {
  if (voicePreviewConfigured) {
    const previewVoiceControl = document.querySelector('.dynaris-widget-header-voice');
    if (previewVoiceControl) {
      previewVoiceControl.setAttribute('data-state', 'preview');
      previewVoiceControl.setAttribute(
        'title',
        'Voice preview configured. Add voiceAgentId to enable live browser voice.'
      );
      previewVoiceControl.setAttribute(
        'aria-label',
        'Voice preview configured. Add voiceAgentId to enable live browser voice.'
      );
    }
  }
  window.__dynarisPlayground = ctrl;
}
