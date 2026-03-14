import { getOrCreateSessionId } from './session.js';
import { sendMessage as apiSendMessage, fetchMessages, createEventSource } from './api.js';
import { createWidget, appendMessage } from './ui.js';

const POLL_INTERVAL_MS = 2500;

export function init(config = {}) {
  const userId = config.userId ?? config.user_id;
  if (!userId) {
    console.error('[DynarisWidget] userId (or user_id) is required');
    return null;
  }

  const sessionId = getOrCreateSessionId();
  const apiUrl = config.apiUrl ?? config.api_url ?? 'https://api.dynaris.ai';
  const usePolling = config.usePolling ?? !config.useSse;
  const title = config.title ?? 'Chat';

  const ui = createWidget({
    apiUrl,
    userId,
    title: config.title ?? 'Text Support',
    subtitle: config.subtitle ?? 'AI assistant',
    position: config.position ?? 'bottom-right',
    stylesUrl: config.stylesUrl,
    welcomeMessage: config.welcomeMessage,
    privacyPolicyUrl: config.privacyPolicyUrl,
    poweredByUrl: config.poweredByUrl,
    poweredByLogoUrl: config.poweredByLogoUrl,
    headerLogoUrl: config.headerLogoUrl,
    logoUrl: config.logoUrl,
  });

  if (!ui) return null;

  const {
    btn,
    panel,
    messagesEl,
    input,
    sendBtn,
    minimizeBtn,
  } = ui;

  let pollTimer = null;
  let lastMessageId = null;
  let eventSource = null;

  function showPanel() {
    panel.style.display = 'flex';
    btn.setAttribute('aria-expanded', 'true');
  }

  function hidePanel() {
    panel.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    const open = panel.style.display === 'flex';
    if (open) hidePanel();
    else showPanel();
  }

  function addOutboundMessage(text) {
    appendMessage(messagesEl, {
      content: { body: text },
      direction: 'outbound',
      createdAt: new Date().toISOString(),
    }, 'outbound');
  }

  let soundEnabled = true;
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('dynaris_widget_sound');
    soundEnabled = stored !== 'false';
  }

  function playNotifySound() {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  }

  function addInboundMessage(msg) {
    const dir = msg.direction === 'outbound' ? 'inbound' : 'outbound';
    appendMessage(messagesEl, msg, dir);
    if (msg.id) lastMessageId = msg.id;
    if (soundEnabled && panel.style.display === 'flex') playNotifySound();
  }

  async function sendText(text) {
    const t = String(text).trim();
    if (!t) return;

    sendBtn.disabled = true;
    addOutboundMessage(t);
    input.value = '';

    try {
      await apiSendMessage(apiUrl, userId, sessionId, t);
    } catch (e) {
      console.error('[DynarisWidget] Send failed:', e);
    } finally {
      sendBtn.disabled = false;
    }
  }

  async function pollMessages() {
    try {
      const data = await fetchMessages(apiUrl, userId, sessionId, lastMessageId);
      const messages = data.messages ?? [];
      for (const m of messages) {
        if (m.direction === 'outbound' && m.id !== lastMessageId) {
          addInboundMessage(m);
        }
      }
    } catch (_) {}
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(pollMessages, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function connectSse() {
    if (eventSource) return;
    eventSource = createEventSource(apiUrl, userId, sessionId, addInboundMessage);
  }

  function disconnectSse() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  function onClose() {
    hidePanel();
    if (usePolling) stopPolling();
    else disconnectSse();
  }

  btn.addEventListener('click', () => {
    togglePanel();
    if (panel.style.display === 'flex') {
      if (usePolling) startPolling();
      else connectSse();
    } else {
      onClose();
    }
  });

  minimizeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClose();
  });

  sendBtn.addEventListener('click', () => sendText(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText(input.value);
    }
  });

  const controller = {
    show: showPanel,
    hide: hidePanel,
    toggle: togglePanel,
    send: sendText,
    destroy() {
      stopPolling();
      disconnectSse();
      ui.container.remove();
    },
  };

  return controller;
}
