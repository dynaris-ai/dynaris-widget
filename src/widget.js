import { getOrCreateSessionId } from './session.js';
import { sendMessage as apiSendMessage, fetchMessages, createEventSource } from './api.js';
import {
  createWidget,
  appendMessage,
  appendTypingIndicator,
  removeTypingIndicator,
  appendMessageWithTypewriter,
  appendWaitingHint,
  removeWaitingHint,
} from './ui.js';

const POLL_INTERVAL_MS = 2500;

export function init(config = {}) {
  const apiKey = config.apiKey ?? config.api_key;
  const userId = config.userId ?? config.user_id;
  if (!apiKey && !userId) {
    console.error('[DynarisWidget] apiKey (or api_key) or userId is required');
    return null;
  }

  const sessionId = getOrCreateSessionId();
  const apiUrl = config.apiUrl ?? config.api_url ?? 'https://api.dynaris.ai';
  const usePolling = config.usePolling ?? !config.useSse;
  const title = config.title ?? 'Chat';

  const ui = createWidget({
    apiUrl,
    userId,
    title: config.title ?? 'Chat with us',
    subtitle: config.subtitle ?? 'Speak directly with our AI',
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
    addBtn,
    fileInput,
    attachmentsPreview,
    menuBtn,
    menuDropdown,
    soundItem,
    soundToggleTrack,
    minimizeBtn,
    welcomeMessage,
  } = ui;

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  let pendingAttachments = [];

  let welcomeShown = false;

  let pollTimer = null;
  let lastMessageId = null;
  let eventSource = null;
  const recentOptimisticBodies = []; // { body, at }[] — skip matching inbound from poll

  async function showPanel() {
    unlockAudio();
    panel.style.display = 'flex';
    btn.setAttribute('aria-expanded', 'true');
    panel.classList.add('dynaris-widget-panel-opening');
    setTimeout(() => panel.classList.remove('dynaris-widget-panel-opening'), 350);

    if (welcomeMessage && !welcomeShown) {
      welcomeShown = true;
      appendTypingIndicator(messagesEl);
      await new Promise((r) => setTimeout(r, 700));
      removeTypingIndicator(messagesEl);
      await appendMessageWithTypewriter(
        messagesEl,
        { content: { body: welcomeMessage } },
        'inbound',
        true,
        6
      );
      if (soundEnabled) playNotifySound();
      appendWaitingHint(messagesEl);
    }
  }

  function hidePanel() {
    panel.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    const open = panel.style.display === 'flex';
    if (open) {
      onClose();
    } else {
      showPanel();
      if (usePolling) startPolling();
      else connectSse();
    }
  }

  function addOutboundMessage(text, attachments = []) {
    if (text) {
      appendMessage(messagesEl, {
        content: { body: text },
        messageType: 'text',
        direction: 'outbound',
        createdAt: new Date().toISOString(),
      }, 'outbound');
    }
    for (const att of attachments) {
      const kind = (att.mime_type || '').startsWith('image/') ? 'image' : 'document';
      appendMessage(messagesEl, {
        content: {
          url: att.data_url,
          mimeType: att.mime_type,
          filename: att.filename,
          caption: '',
        },
        messageType: kind,
        direction: 'outbound',
        createdAt: new Date().toISOString(),
      }, 'outbound');
    }
  }

  function renderAttachmentChips() {
    attachmentsPreview.innerHTML = '';
    attachmentsPreview.style.display = pendingAttachments.length ? 'flex' : 'none';
    for (let i = 0; i < pendingAttachments.length; i++) {
      const att = pendingAttachments[i];
      const chip = document.createElement('span');
      chip.className = 'dynaris-widget-attachment-chip';
      chip.textContent = att.filename || 'file';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'dynaris-widget-attachment-remove';
      remove.innerHTML = '&times;';
      remove.setAttribute('aria-label', 'Remove');
      remove.onclick = () => {
        pendingAttachments.splice(i, 1);
        renderAttachmentChips();
      };
      chip.appendChild(remove);
      attachmentsPreview.appendChild(chip);
    }
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File too large: ${file.name}`));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
        resolve({
          data_base64: base64,
          mime_type: file.type || 'application/octet-stream',
          filename: file.name,
          data_url: dataUrl,
        });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  let soundEnabled = true;
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('dynaris_widget_sound');
    soundEnabled = stored !== 'false';
  }

  let audioContext = null;

  function unlockAudio() {
    if (audioContext) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioContext = new Ctx();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (_) {}
  }

  function updateSoundToggle() {
    soundToggleTrack.classList.toggle('is-on', soundEnabled);
  }
  updateSoundToggle();

  function playNotifySound() {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const ctx = audioContext;
      const t = ctx.currentTime;
      const ding = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
        osc.start(start);
        osc.stop(start + dur);
      };
      ding(880, t, 0.12);
      ding(1100, t + 0.08, 0.1);
    } catch (_) {}
  }

  function closeMenu() {
    menuDropdown.classList.remove('is-open');
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle('is-open');
  });

  soundItem.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dynaris_widget_sound', soundEnabled ? 'true' : 'false');
    }
    updateSoundToggle();
    if (soundEnabled) playNotifySound();
    closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!menuDropdown.contains(e.target) && !menuBtn.contains(e.target)) {
      closeMenu();
    }
  });

  function addInboundMessage(msg) {
    removeTypingIndicator(messagesEl);
    const dir = msg.direction === 'outbound' ? 'inbound' : 'outbound';
    appendMessage(messagesEl, msg, dir);
    if (msg.id) lastMessageId = msg.id;
    if (soundEnabled && panel.style.display === 'flex') playNotifySound();
  }

  async function sendText(text) {
    const t = String(text || '').trim();
    if (!t && pendingAttachments.length === 0) return;

    removeWaitingHint(messagesEl);
    sendBtn.disabled = true;
    const toSend = [...pendingAttachments];
    addOutboundMessage(t || null, toSend);
    if (t) recentOptimisticBodies.push({ body: t, at: Date.now() });
    input.value = '';
    pendingAttachments = [];
    renderAttachmentChips();
    appendTypingIndicator(messagesEl);

    try {
      await apiSendMessage(apiUrl, userId, sessionId, t || '', apiKey, toSend.map((a) => ({
        data_base64: a.data_base64,
        mime_type: a.mime_type,
        filename: a.filename,
      })));
    } catch (e) {
      console.error('[DynarisWidget] Send failed:', e?.message ?? e, 'status=', e?.status);
    } finally {
      sendBtn.disabled = false;
    }
  }

  async function pollMessages() {
    try {
      const now = Date.now();
      const maxAge = 10000;
      for (let i = recentOptimisticBodies.length - 1; i >= 0; i--) {
        if (now - recentOptimisticBodies[i].at > maxAge) recentOptimisticBodies.splice(i, 1);
      }
      const data = await fetchMessages(apiUrl, userId, sessionId, lastMessageId, apiKey);
      const messages = data.messages ?? [];
      for (const m of messages) {
        const isUserMessage = m.direction === 'inbound';
        if (isUserMessage && recentOptimisticBodies.length > 0) {
          const body = (m.content?.body ?? '').trim();
          const idx = recentOptimisticBodies.findIndex(
            (o) => o.body === body && now - o.at < 5000
          );
          if (idx >= 0) {
            recentOptimisticBodies.splice(idx, 1);
            if (m.id) lastMessageId = m.id;
            continue;
          }
        }
        if (m.direction === 'outbound') {
          addInboundMessage(m);
        } else {
          appendMessage(messagesEl, m, 'outbound');
        }
        if (m.id) lastMessageId = m.id;
      }
    } catch (e) {
      if (e?.status === 401) {
        console.error('[DynarisWidget] Poll failed: Invalid API key (401). Check NEXT_PUBLIC_CHAT_WIDGET_API_KEY.');
      } else if (e?.status) {
        console.error('[DynarisWidget] Poll failed:', e?.message ?? e, 'status=', e.status);
      }
    }
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
    eventSource = createEventSource(apiUrl, userId, sessionId, addInboundMessage, apiKey);
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

  btn.addEventListener('click', () => togglePanel());

  minimizeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClose();
  });

  addBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const files = Array.from(fileInput.files || []);
    fileInput.value = '';
    for (const f of files) {
      try {
        const att = await readFileAsBase64(f);
        pendingAttachments.push(att);
      } catch (e) {
        console.warn('[DynarisWidget] Skip file:', f.name, e);
      }
    }
    renderAttachmentChips();
  });

  input.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    let hasImage = false;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        hasImage = true;
        const file = item.getAsFile();
        if (file) {
          try {
            const att = await readFileAsBase64(file);
            pendingAttachments.push(att);
            renderAttachmentChips();
          } catch (err) {
            console.warn('[DynarisWidget] Paste image failed:', err);
          }
        }
        break;
      }
    }
    if (hasImage) e.preventDefault();
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
