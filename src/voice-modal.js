/**
 * In-widget voice overlay.
 *
 * Renders a card that slides over the chat messages area while a voice session
 * is active. Shows: animated waveform, status text, scrollable transcript, and
 * mute / end-call controls.
 *
 * Usage:
 *   const modal = createVoiceOverlay(panelEl);
 *   modal.open();
 *   modal.setState('connecting', 'Connecting…');
 *   modal.setState('live', 'Voice AI is live.');
 *   modal.addTranscript('ai', 'Hello, how can I help?');
 *   modal.setMicMuted(true);   // reflect button state from outside
 *   modal.dismiss();   // hide overlay (transcript kept until next open())
 *   modal.destroy();
 *
 * Callbacks:
 *   onEndCall()       — user pressed end-call button
 *   onToggleMic()     — user pressed mute button; receives current isMuted state
 *   onBackToChat()    — user dismissed ended/error view (“Back to chat”)
 */

const WAVE_BARS = 9;

const ICONS_SVG = {
  micOn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 19v3"/><path d="M8 23h8"/></svg>',
  micOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-1"/><path d="M5 10v1a7 7 0 0 0 11.9 5.18"/><path d="M12 19v3"/><path d="M8 23h8"/><path d="M9 5V3a3 3 0 0 1 5.12-2.12"/></svg>',
  phoneOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.05"/><path d="M22 16.92v3a2 2 0 0 1-2.18 2"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
  bot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  chevronLeft:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
};

export function createVoiceOverlay(panel, { onEndCall, onToggleMic, onBackToChat } = {}) {
  let isMuted = false;
  let destroyed = false;

  /* ── Root overlay ─────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.className = 'dynaris-widget-voice-overlay';
  overlay.setAttribute('aria-live', 'polite');
  overlay.style.display = 'none';

  /* ── Wave ──────────────────────────────────────────────────────── */
  const wave = document.createElement('div');
  wave.className = 'dynaris-widget-voice-wave';
  for (let i = 0; i < WAVE_BARS; i++) {
    const bar = document.createElement('span');
    bar.className = 'dynaris-widget-voice-wave-bar';
    wave.appendChild(bar);
  }

  /* ── Status ────────────────────────────────────────────────────── */
  const statusEl = document.createElement('p');
  statusEl.className = 'dynaris-widget-voice-status';
  statusEl.textContent = 'Connecting…';

  /* ── Transcript ────────────────────────────────────────────────── */
  const transcriptWrap = document.createElement('div');
  transcriptWrap.className = 'dynaris-widget-voice-transcript';

  const transcriptInner = document.createElement('div');
  transcriptInner.className = 'dynaris-widget-voice-transcript-inner';
  transcriptWrap.appendChild(transcriptInner);

  /* ── Controls ──────────────────────────────────────────────────── */
  const controls = document.createElement('div');
  controls.className = 'dynaris-widget-voice-controls';

  const controlsCall = document.createElement('div');
  controlsCall.className = 'dynaris-widget-voice-controls-call';

  const muteBtn = document.createElement('button');
  muteBtn.type = 'button';
  muteBtn.className = 'dynaris-widget-voice-mute-btn';
  muteBtn.setAttribute('aria-label', 'Mute microphone');
  muteBtn.innerHTML = ICONS_SVG.micOn;
  muteBtn.addEventListener('click', () => {
    if (destroyed) return;
    isMuted = !isMuted;
    _updateMuteBtn();
    onToggleMic?.(isMuted);
  });

  const endBtn = document.createElement('button');
  endBtn.type = 'button';
  endBtn.className = 'dynaris-widget-voice-end-btn';
  endBtn.setAttribute('aria-label', 'End call');
  endBtn.innerHTML = ICONS_SVG.phoneOff;
  endBtn.addEventListener('click', () => {
    if (destroyed) return;
    onEndCall?.();
  });

  controlsCall.appendChild(muteBtn);
  controlsCall.appendChild(endBtn);

  const controlsPost = document.createElement('div');
  controlsPost.className = 'dynaris-widget-voice-controls-post';
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'dynaris-widget-voice-back-btn';
  backBtn.setAttribute('aria-label', 'Back to chat');
  backBtn.innerHTML = `${ICONS_SVG.chevronLeft}<span class="dynaris-widget-voice-back-btn-label">Back to chat</span>`;
  backBtn.addEventListener('click', () => {
    if (destroyed) return;
    dismiss();
    onBackToChat?.();
  });
  controlsPost.appendChild(backBtn);

  controls.appendChild(controlsCall);
  controls.appendChild(controlsPost);
  controlsPost.hidden = true;

  /* ── Assemble ──────────────────────────────────────────────────── */
  overlay.appendChild(wave);
  overlay.appendChild(statusEl);
  overlay.appendChild(transcriptWrap);
  overlay.appendChild(controls);
  panel.appendChild(overlay);

  /* ── Helpers ───────────────────────────────────────────────────── */
  function _updateMuteBtn() {
    muteBtn.innerHTML = isMuted ? ICONS_SVG.micOff : ICONS_SVG.micOn;
    muteBtn.setAttribute('aria-label', isMuted ? 'Unmute microphone' : 'Mute microphone');
    muteBtn.classList.toggle('is-muted', isMuted);
  }

  function _syncChromeForState(state) {
    const postCall = state === 'ended' || state === 'error';
    controlsCall.hidden = postCall;
    controlsPost.hidden = !postCall;
    muteBtn.hidden = state === 'disconnecting';
    endBtn.disabled = state === 'disconnecting';
  }

  /* ── Public API ────────────────────────────────────────────────── */
  function open(options = {}) {
    if (destroyed) return;
    const clearTranscript = options.clearTranscript !== false;
    if (clearTranscript) {
      transcriptInner.innerHTML = '';
    }
    isMuted = false;
    _updateMuteBtn();
    overlay.setAttribute('data-voice-state', 'connecting');
    _syncChromeForState('connecting');
    overlay.style.display = 'flex';
  }

  function dismiss() {
    if (destroyed) return;
    overlay.style.display = 'none';
    overlay.setAttribute('aria-busy', 'false');
  }

  function close() {
    dismiss();
  }

  function setState(state, message) {
    if (destroyed) return;
    overlay.setAttribute('data-voice-state', state);
    overlay.setAttribute('aria-busy', state === 'connecting' ? 'true' : 'false');
    statusEl.textContent = message || state;
    _syncChromeForState(state);
  }

  function addTranscript(speaker, text) {
    if (destroyed || !text?.trim()) return;

    const row = document.createElement('div');
    row.className = `dynaris-widget-voice-transcript-row dynaris-widget-voice-transcript-row--${speaker}`;

    const icon = document.createElement('span');
    icon.className = 'dynaris-widget-voice-transcript-icon';
    icon.innerHTML = speaker === 'ai' ? ICONS_SVG.bot : ICONS_SVG.user;

    const bubble = document.createElement('span');
    bubble.className = 'dynaris-widget-voice-transcript-bubble';
    bubble.textContent = text;

    row.appendChild(icon);
    row.appendChild(bubble);
    transcriptInner.appendChild(row);
    transcriptWrap.scrollTop = transcriptWrap.scrollHeight;
  }

  function setMicMuted(muted) {
    isMuted = Boolean(muted);
    _updateMuteBtn();
  }

  function destroy() {
    destroyed = true;
    overlay.remove();
  }

  return { open, close, dismiss, setState, addTranscript, setMicMuted, destroy };
}
