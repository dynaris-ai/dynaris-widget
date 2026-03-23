import { tokenizeInlineText } from './message-format.js';
import poweredByMarkSvgRaw from './assets/dynaris.svg?raw';
import { parseVoicePhoneNumber } from './voice-phone.js';

function scrollMessagesPanelToBottom(messagesListEl) {
  const scrollRoot = messagesListEl?.parentElement;
  if (scrollRoot) scrollRoot.scrollTop = scrollRoot.scrollHeight;
}

const ICONS = {
  chat: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>',
  back: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>',
  menu: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>',
  sparkle: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4zm14 10l-2 2 1 3 3-1-2-2-2 2-1-3-3 1 2 2zm-8 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" /></svg>',
  minimize: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>',
  emoji: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>',
  volume: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>',
  privacy: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" /></svg>',
  mic: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 19v3"/><path d="M8 23h8"/></svg>',
  voice: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4"/><path d="M8 7v10"/><path d="M12 4v16"/><path d="M16 7v10"/><path d="M20 10v4"/></svg>',
  phone: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
};

function appendPoweredByMark(footerLink, poweredByLogoUrl) {
  const url =
    typeof poweredByLogoUrl === 'string' && poweredByLogoUrl.trim() !== ''
      ? poweredByLogoUrl.trim()
      : null;
  if (url) {
    const logoImg = document.createElement('img');
    logoImg.src = url;
    logoImg.alt = '';
    logoImg.className = 'dynaris-widget-footer-logo';
    footerLink.appendChild(logoImg);
    return;
  }

  const tpl = document.createElement('template');
  tpl.innerHTML = poweredByMarkSvgRaw.trim();
  const parsed = tpl.content.firstElementChild;
  if (
    !parsed ||
    parsed.namespaceURI !== 'http://www.w3.org/2000/svg' ||
    parsed.localName !== 'svg'
  ) {
    throw new Error('DynarisWidget: bundled dynaris.svg is missing or invalid');
  }

  const svg = parsed.cloneNode(true);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('class', 'dynaris-widget-footer-logo');
  svg.setAttribute('aria-hidden', 'true');
  svg.querySelectorAll('[fill]').forEach((node) => {
    const f = node.getAttribute('fill');
    if (f && f !== 'none') {
      node.setAttribute('fill', 'currentColor');
    }
  });
  footerLink.appendChild(svg);
}

export function createWidget(config) {
  const {
    apiUrl = 'https://api.dynaris.ai',
    userId,
    title = 'Chat with us',
    subtitle = 'Speak directly with our AI',
    position = 'bottom-right',
    welcomeMessage = null,
    privacyPolicyUrl = null,
    poweredByUrl = 'https://dynaris.ai',
    poweredByLogoUrl = null,
    headerLogoUrl = null,
    logoUrl = null,
    embedPageUrl = null,
    viewer = 'embed',
    hidePoweredBy = false,
    voiceEnabled = false,
    voicePhoneNumber = null,
    voiceCallUrl = null,
    voiceCallLabel = 'Call our voice AI',
  } = config;

  const voiceCallUrlTrimmed =
    typeof voiceCallUrl === 'string' && voiceCallUrl.trim() !== ''
      ? voiceCallUrl.trim()
      : null;
  const voiceDialParsed = parseVoicePhoneNumber(
    typeof voicePhoneNumber === 'string' ? voicePhoneNumber : '',
  );
  const voiceHeaderHref = voiceCallUrlTrimmed ?? voiceDialParsed?.telHref ?? null;
  const shouldRenderVoiceButton = Boolean(voiceEnabled);

  const container = document.createElement('div');
  container.className = 'dynaris-widget-container';
  document.body.appendChild(container);

  const btn = document.createElement('button');
  btn.className = 'dynaris-widget-btn';
  if (logoUrl) {
    const btnImg = document.createElement('img');
    btnImg.src = logoUrl;
    btnImg.alt = '';
    btnImg.className = 'dynaris-widget-btn-logo';
    btn.appendChild(btnImg);
  } else {
    btn.innerHTML = ICONS.chat;
  }
  btn.setAttribute('aria-label', 'Open chat');

  const panel = document.createElement('div');
  panel.className = 'dynaris-widget-panel';
  panel.style.display = 'none';

  const header = document.createElement('div');
  header.className = 'dynaris-widget-panel-header';

  const centerSection = document.createElement('div');
  centerSection.className = 'dynaris-widget-header-center';

  if (headerLogoUrl) {
    const logoImg = document.createElement('img');
    logoImg.src = headerLogoUrl;
    logoImg.alt = '';
    logoImg.className = 'dynaris-widget-header-logo';
    centerSection.appendChild(logoImg);
  }

  const agentPill = document.createElement('div');
  agentPill.className = 'dynaris-widget-header-agent';

  const avatar = document.createElement('div');
  avatar.className = 'dynaris-widget-avatar';
  if (logoUrl || headerLogoUrl) {
    const avatarImg = document.createElement('img');
    avatarImg.src = logoUrl || headerLogoUrl;
    avatarImg.alt = '';
    avatarImg.className = 'dynaris-widget-avatar-img';
    avatar.appendChild(avatarImg);
  } else {
    avatar.innerHTML = ICONS.sparkle;
  }
  const onlineDot = document.createElement('span');
  onlineDot.className = 'dynaris-widget-avatar-online';
  avatar.appendChild(onlineDot);

  const agentInfo = document.createElement('div');
  agentInfo.className = 'dynaris-widget-agent-info';
  const agentName = document.createElement('div');
  agentName.className = 'dynaris-widget-agent-name';
  agentName.textContent = title;
  const agentSubtitle = document.createElement('div');
  agentSubtitle.className = 'dynaris-widget-agent-subtitle';
  agentSubtitle.textContent = subtitle;
  agentInfo.appendChild(agentName);
  agentInfo.appendChild(agentSubtitle);

  agentPill.appendChild(avatar);
  agentPill.appendChild(agentInfo);
  centerSection.appendChild(agentPill);

  const menuNav = document.createElement('div');
  menuNav.className = 'dynaris-widget-header-nav dynaris-widget-header-nav-left';

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'dynaris-widget-header-menu';
  menuBtn.innerHTML = ICONS.menu;
  menuBtn.setAttribute('aria-label', 'Menu');

  const menuDropdown = document.createElement('div');
  menuDropdown.className = 'dynaris-widget-menu-dropdown';

  const soundItem = document.createElement('button');
  soundItem.type = 'button';
  soundItem.className = 'dynaris-widget-menu-item dynaris-widget-menu-item-toggle';
  soundItem.setAttribute('data-sound-toggle', '1');

  const soundLabelWrap = document.createElement('span');
  soundLabelWrap.className = 'dynaris-widget-sound-label-wrap';
  soundLabelWrap.innerHTML = `${ICONS.volume}<span class="dynaris-widget-sound-label-text">Sound</span>`;

  const toggleTrack = document.createElement('span');
  toggleTrack.className = 'dynaris-widget-toggle-track';
  const toggleThumb = document.createElement('span');
  toggleThumb.className = 'dynaris-widget-toggle-thumb';
  toggleTrack.appendChild(toggleThumb);

  soundItem.appendChild(soundLabelWrap);
  soundItem.appendChild(toggleTrack);

  menuDropdown.appendChild(soundItem);
  menuNav.appendChild(menuBtn);

  const minimizeBtn = document.createElement('button');
  minimizeBtn.type = 'button';
  minimizeBtn.className = 'dynaris-widget-header-minimize';
  minimizeBtn.innerHTML = ICONS.minimize;
  minimizeBtn.setAttribute('aria-label', 'Minimize');

  const headerRight = document.createElement('div');
  headerRight.className = 'dynaris-widget-header-right';

  let voiceControl = null;
  if (shouldRenderVoiceButton) {
    const voiceBtn = document.createElement('button');
    voiceBtn.type = 'button';
    voiceBtn.className = 'dynaris-widget-header-voice';
    voiceBtn.innerHTML = `<span class="dynaris-widget-header-voice-icon" aria-hidden="true">${ICONS.voice}</span>`;
    voiceBtn.setAttribute('aria-label', voiceCallLabel);
    voiceBtn.setAttribute('data-state', 'idle');
    const voiceTooltip = document.createElement('span');
    voiceTooltip.className = 'dynaris-widget-header-voice-tooltip';
    voiceTooltip.setAttribute('aria-hidden', 'true');
    voiceTooltip.textContent = voiceCallLabel;
    voiceBtn.appendChild(voiceTooltip);
    headerRight.appendChild(voiceBtn);
    voiceControl = voiceBtn;
  } else if (voiceHeaderHref) {
    const voiceLink = document.createElement('a');
    voiceLink.href = voiceHeaderHref;
    voiceLink.className = 'dynaris-widget-header-voice';
    if (voiceCallUrlTrimmed) {
      voiceLink.target = '_blank';
      voiceLink.rel = 'noopener noreferrer';
    }
    voiceLink.innerHTML = `<span class="dynaris-widget-header-voice-icon" aria-hidden="true">${ICONS.phone}</span>`;
    let voiceAria = voiceCallLabel;
    let voiceTitle = voiceCallLabel;
    if (voiceCallUrlTrimmed) {
      voiceAria = `${voiceCallLabel} Opens in a new tab.`;
      voiceTitle = `${voiceCallLabel} · Opens website`;
    } else if (voiceDialParsed) {
      voiceAria = `${voiceCallLabel} Dials ${voiceDialParsed.display}.`;
      voiceTitle = `${voiceCallLabel} · ${voiceDialParsed.display}`;
    }
    voiceLink.setAttribute('aria-label', voiceAria);
    voiceLink.setAttribute('title', voiceTitle);
    headerRight.appendChild(voiceLink);
    voiceControl = voiceLink;
  }

  headerRight.appendChild(minimizeBtn);

  header.appendChild(menuNav);
  header.appendChild(centerSection);
  header.appendChild(headerRight);

  const messagesArea = document.createElement('div');
  messagesArea.className = 'dynaris-widget-panel-messages-area';

  const messagesScroll = document.createElement('div');
  messagesScroll.className = 'dynaris-widget-panel-messages';

  const messagesEl = document.createElement('div');
  messagesEl.className = 'dynaris-widget-panel-messages-body';

  const privacySlot = document.createElement('div');
  privacySlot.className = 'dynaris-widget-privacy-slot';

  const privacyCard = document.createElement('div');
  privacyCard.className = 'dynaris-widget-privacy-card';

  const privacyNote = document.createElement('div');
  privacyNote.className = 'dynaris-widget-privacy-note';
  privacyNote.innerHTML = ICONS.privacy;
  const privacyText = document.createElement('span');
  privacyText.className = 'dynaris-widget-privacy-note-text';
  if (privacyPolicyUrl) {
    const privacyLink = document.createElement('a');
    privacyLink.href = privacyPolicyUrl;
    privacyLink.target = '_blank';
    privacyLink.rel = 'noopener noreferrer';
    privacyLink.className = 'dynaris-widget-privacy-link';
    privacyLink.textContent = 'Privacy Policy';
    privacyText.append(
      document.createTextNode('By chatting, you agree to processing per our '),
      privacyLink,
      document.createTextNode('.'),
    );
  } else {
    privacyText.textContent =
      'By chatting, you agree to processing and recording.';
  }
  privacyNote.appendChild(privacyText);
  const privacyDismiss = document.createElement('button');
  privacyDismiss.type = 'button';
  privacyDismiss.className = 'dynaris-widget-privacy-dismiss';
  privacyDismiss.setAttribute('aria-label', 'Dismiss privacy notice');
  privacyDismiss.innerHTML = '&times;';
  privacyCard.appendChild(privacyNote);
  privacyCard.appendChild(privacyDismiss);
  privacySlot.appendChild(privacyCard);

  messagesScroll.appendChild(messagesEl);
  messagesArea.appendChild(messagesScroll);
  messagesArea.appendChild(privacySlot);

  const inputSection = document.createElement('div');
  inputSection.className = 'dynaris-widget-input-section';

  const dictationBtn = document.createElement('button');
  dictationBtn.type = 'button';
  dictationBtn.className = 'dynaris-widget-dictation-btn';
  dictationBtn.innerHTML = ICONS.mic;
  dictationBtn.setAttribute('aria-label', 'Start dictation');

  const inputWrap = document.createElement('div');
  inputWrap.className = 'dynaris-widget-input-wrap';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'dynaris-widget-input-add';
  addBtn.innerHTML = ICONS.plus;
  addBtn.setAttribute('aria-label', 'Attach');

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt,application/pdf';
  fileInput.style.display = 'none';

  const attachmentsPreview = document.createElement('div');
  attachmentsPreview.className = 'dynaris-widget-attachments-preview';

  const input = document.createElement('input');
  input.className = 'dynaris-widget-input';
  input.type = 'text';
  input.placeholder = 'Write a message...';
  input.autocomplete = 'off';

  const sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'dynaris-widget-send';
  sendBtn.innerHTML = ICONS.send;
  sendBtn.setAttribute('aria-label', 'Send');

  inputSection.appendChild(attachmentsPreview);
  inputWrap.appendChild(addBtn);
  inputWrap.appendChild(fileInput);
  inputWrap.appendChild(input);
  inputWrap.appendChild(dictationBtn);
  inputWrap.appendChild(sendBtn);
  inputSection.appendChild(inputWrap);

  const footer = document.createElement('div');
  footer.className = 'dynaris-widget-footer';
  const footerInner = document.createElement('span');
  footerInner.className = 'dynaris-widget-footer-inner';
  const poweredByText = document.createElement('span');
  poweredByText.className = 'dynaris-widget-footer-powered-by';
  poweredByText.textContent = 'Powered by ';
  footerInner.appendChild(poweredByText);
  const footerLink = document.createElement('a');
  footerLink.href = poweredByUrl || '#';
  footerLink.target = '_blank';
  footerLink.rel = 'noopener';
  footerLink.className = 'dynaris-widget-footer-link';
  appendPoweredByMark(footerLink, poweredByLogoUrl);
  footerLink.appendChild(document.createTextNode(' Dynaris'));
  footerInner.appendChild(footerLink);
  footer.appendChild(footerInner);

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'dynaris-widget-input-wrapper';
  inputWrapper.appendChild(inputSection);

  panel.appendChild(header);
  panel.appendChild(menuDropdown);
  panel.appendChild(messagesArea);
  panel.appendChild(inputWrapper);
  panel.appendChild(footer);

  container.appendChild(btn);
  container.appendChild(panel);

  privacyDismiss.addEventListener('click', () => {
    privacySlot.classList.add('dynaris-widget-privacy-dismissed');
  });

  const isMobileAppViewer = viewer === 'mobile-app';

  if (isMobileAppViewer) {
    container.classList.add('dynaris-widget-viewer-mobile-app');
    btn.style.display = 'none';
    minimizeBtn.innerHTML = ICONS.back;
    minimizeBtn.setAttribute('aria-label', 'Back');
    footer.style.display = hidePoweredBy ? 'none' : '';
  } else {
    const posMap = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px', right: 'auto' },
    };
    const pos = posMap[position] || posMap['bottom-right'];
    Object.assign(btn.style, pos);
    Object.assign(panel.style, { ...pos, bottom: '84px' });
  }

  return {
    container,
    btn,
    panel,
    messagesEl,
    input,
    sendBtn,
    addBtn,
    fileInput,
    attachmentsPreview,
    dictationBtn,
    menuBtn,
    menuDropdown,
    soundItem,
    soundToggleTrack: toggleTrack,
    voiceControl,
    minimizeBtn,
    welcomeMessage: welcomeMessage || null,
    isMobileAppViewer,
    config: {
      apiUrl,
      userId,
      title,
      subtitle,
      position,
      embedPageUrl,
      viewer,
      voiceEnabled,
    },
  };
}

function appendRichText(container, value) {
  const tokens = tokenizeInlineText(value);
  for (const token of tokens) {
    if (token.type === 'lineBreak') {
      container.appendChild(document.createElement('br'));
      continue;
    }

    const node = token.type === 'link' ? document.createElement('a') : document.createElement(token.bold ? 'strong' : 'span');
    if (token.type === 'link') {
      node.href = token.href;
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
      node.textContent = token.value;
      if (token.bold) {
        const strong = document.createElement('strong');
        strong.appendChild(node);
        container.appendChild(strong);
        continue;
      }
    } else {
      node.textContent = token.value;
    }
    container.appendChild(node);
  }
}

function parseMessageBody(msg) {
  const content = msg.content || {};
  const msgType = msg.messageType || msg.message_type || 'text';
  const div = document.createElement('div');
  div.className = 'dynaris-widget-msg-body';

  if (msgType === 'image' && (content.url || content.mediaId)) {
    const img = document.createElement('img');
    img.src = content.url || '';
    img.alt = content.caption || '';
    img.className = 'dynaris-widget-msg-attachment dynaris-widget-msg-image';
    div.appendChild(img);
    if (content.caption) {
      const cap = document.createElement('div');
      cap.className = 'dynaris-widget-msg-caption';
      appendRichText(cap, content.caption);
      div.appendChild(cap);
    }
    return div;
  }

  if (msgType === 'document' && (content.url || content.filename)) {
    const link = document.createElement('a');
    link.href = content.url || '#';
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'dynaris-widget-msg-attachment dynaris-widget-msg-document';
    link.textContent = content.filename || 'Download';
    div.appendChild(link);
    if (content.caption) {
      const cap = document.createElement('div');
      cap.className = 'dynaris-widget-msg-caption';
      appendRichText(cap, content.caption);
      div.appendChild(cap);
    }
    return div;
  }

  const body = content.body ?? content.raw ?? String(msg.content ?? '');
  appendRichText(div, body);
  return div;
}

export function appendMessage(messagesEl, msg, direction, isAgent = false, animate = false) {
  const row = document.createElement('div');
  row.className = `dynaris-widget-msg-row dynaris-widget-msg-row-${direction}`;
  if (animate) {
    row.classList.add('dynaris-widget-msg-enter');
  }

  const avatar = document.createElement('div');
  avatar.className = 'dynaris-widget-msg-avatar';
  avatar.innerHTML = direction === 'inbound' || isAgent ? ICONS.sparkle : ICONS.user;

  const bubble = document.createElement('div');
  bubble.className = `dynaris-widget-msg dynaris-widget-msg-${direction}`;
  bubble.appendChild(parseMessageBody(msg));

  row.appendChild(avatar);
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  scrollMessagesPanelToBottom(messagesEl);
}

export function appendTypingIndicator(messagesEl) {
  const row = document.createElement('div');
  row.className = 'dynaris-widget-msg-row dynaris-widget-msg-row-inbound dynaris-widget-msg-enter';

  const avatar = document.createElement('div');
  avatar.className = 'dynaris-widget-msg-avatar';
  avatar.innerHTML = ICONS.sparkle;

  const typing = document.createElement('div');
  typing.className = 'dynaris-widget-typing-indicator';
  typing.innerHTML = '<span></span><span></span><span></span>';

  row.appendChild(avatar);
  row.appendChild(typing);
  row.dataset.typing = '1';
  messagesEl.appendChild(row);
  scrollMessagesPanelToBottom(messagesEl);
  return row;
}

export function removeTypingIndicator(messagesEl) {
  const row = messagesEl.querySelector('[data-typing="1"]');
  if (row) row.remove();
}

export function appendWaitingHint(messagesEl) {
  const row = document.createElement('div');
  row.className = 'dynaris-widget-msg-row dynaris-widget-msg-row-inbound dynaris-widget-waiting-hint dynaris-widget-msg-enter';
  row.dataset.waitingHint = '1';

  const avatar = document.createElement('div');
  avatar.className = 'dynaris-widget-msg-avatar';
  avatar.innerHTML = ICONS.sparkle;

  const bubble = document.createElement('div');
  bubble.className = 'dynaris-widget-msg dynaris-widget-msg-inbound dynaris-widget-waiting-bubble';
  const bodyEl = document.createElement('div');
  bodyEl.className = 'dynaris-widget-msg-body dynaris-widget-waiting-text';
  bodyEl.textContent = 'Waiting for your message...';
  bubble.appendChild(bodyEl);

  row.appendChild(avatar);
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  scrollMessagesPanelToBottom(messagesEl);
  return row;
}

export function removeWaitingHint(messagesEl) {
  const row = messagesEl.querySelector('[data-waiting-hint="1"]');
  if (row) row.remove();
}

export function appendMessageWithTypewriter(messagesEl, msg, direction, isAgent, charMs = 6) {
  return new Promise((resolve) => {
    const body = msg.content?.body ?? msg.content?.raw ?? String(msg.content ?? '');

    const row = document.createElement('div');
    row.className = `dynaris-widget-msg-row dynaris-widget-msg-row-${direction} dynaris-widget-msg-enter`;

    const avatar = document.createElement('div');
    avatar.className = 'dynaris-widget-msg-avatar';
    avatar.innerHTML = direction === 'inbound' || isAgent ? ICONS.sparkle : ICONS.user;

    const bubble = document.createElement('div');
    bubble.className = `dynaris-widget-msg dynaris-widget-msg-${direction}`;
    const bodyEl = document.createElement('div');
    bodyEl.className = 'dynaris-widget-msg-body';
    bubble.appendChild(bodyEl);

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesEl.appendChild(row);

    let i = 0;

    function tick() {
      if (i < body.length) {
        bodyEl.textContent = body.slice(0, i + 1);
        i += 1;
        scrollMessagesPanelToBottom(messagesEl);
        setTimeout(tick, charMs);
      } else {
        bodyEl.textContent = '';
        appendRichText(bodyEl, body);
        scrollMessagesPanelToBottom(messagesEl);
        resolve();
      }
    }
    tick();
  });
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
