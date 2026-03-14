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
};

const DYNARIS_MINI_LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 130 130"><path d="M65 0C100.899 0 130 29.1015 130 65C130 100.899 100.899 130 65 130H25.5537C31.0766 130 35.5537 125.523 35.5537 120V111.926C35.5537 109.376 36.5282 106.922 38.2773 105.066L56.1172 86.1406C58.0066 84.1363 60.64 83 63.3945 83H69.1299C74.6527 83 79.1299 78.5229 79.1299 73V57C79.1298 51.4772 74.6527 47 69.1299 47H63.3428C60.5882 47 57.9549 45.8638 56.0654 43.8594L38.2773 24.9893C36.5283 23.1338 35.5538 20.6798 35.5537 18.1299V10C35.5536 4.47723 31.0765 0 25.5537 0H65ZM0 28.9629C1.26271 33.0392 5.06238 36 9.55371 36H18.8535C21.6081 36 24.2414 37.1363 26.1309 39.1406L40.4062 54.2852C42.1554 56.1407 43.1299 58.5945 43.1299 61.1445V68.9102C43.1298 71.4601 42.1553 73.9141 40.4062 75.7695L26.1816 90.8594C24.2922 92.8638 21.6589 94 18.9043 94H9.55371C5.06282 94 1.26308 96.9604 0 101.036V28.9629Z" fill="#010101"/></svg>';

export function createWidget(config) {
  const {
    apiUrl = 'https://api.dynaris.ai',
    userId,
    title = 'Text Support',
    subtitle = 'AI assistant',
    position = 'bottom-right',
    welcomeMessage = null,
    privacyPolicyUrl = null,
    poweredByUrl = 'https://dynaris.ai',
    poweredByLogoUrl = null,
    headerLogoUrl = null,
    logoUrl = null,
    embedPageUrl = null,
  } = config;

  if (!userId) {
    console.error('[DynarisWidget] user_id is required');
    return null;
  }

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

  const minimizeBtn = document.createElement('button');
  minimizeBtn.type = 'button';
  minimizeBtn.className = 'dynaris-widget-header-minimize';
  minimizeBtn.innerHTML = ICONS.minimize;
  minimizeBtn.setAttribute('aria-label', 'Minimize');

  header.appendChild(centerSection);
  header.appendChild(minimizeBtn);

  const messagesEl = document.createElement('div');
  messagesEl.className = 'dynaris-widget-panel-messages';

  const privacyBanner = document.createElement('div');
  privacyBanner.className = 'dynaris-widget-privacy-banner';
  const privacyText = document.createElement('span');
  if (privacyPolicyUrl) {
    privacyText.innerHTML = 'By chatting here, you agree we and authorized partners may process, monitor, and record this chat and your data in line with ';
    const privacyLink = document.createElement('a');
    privacyLink.href = privacyPolicyUrl;
    privacyLink.target = '_blank';
    privacyLink.rel = 'noopener';
    privacyLink.textContent = 'Privacy Policy';
    privacyText.appendChild(privacyLink);
    privacyText.appendChild(document.createTextNode('.'));
  } else {
    privacyText.textContent = 'By chatting here, you agree we and authorized partners may process, monitor, and record this chat and your data.';
  }
  const privacyDismiss = document.createElement('button');
  privacyDismiss.type = 'button';
  privacyDismiss.className = 'dynaris-widget-privacy-dismiss';
  privacyDismiss.innerHTML = '&times;';
  privacyDismiss.setAttribute('aria-label', 'Dismiss');
  privacyBanner.appendChild(privacyText);
  privacyBanner.appendChild(privacyDismiss);

  const inputSection = document.createElement('div');
  inputSection.className = 'dynaris-widget-input-section';

  const inputWrap = document.createElement('div');
  inputWrap.className = 'dynaris-widget-input-wrap';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'dynaris-widget-input-add';
  addBtn.innerHTML = ICONS.plus;
  addBtn.setAttribute('aria-label', 'Attach');

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

  inputWrap.appendChild(addBtn);
  inputWrap.appendChild(input);
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
  if (poweredByLogoUrl) {
    const logoImg = document.createElement('img');
    logoImg.src = poweredByLogoUrl;
    logoImg.alt = '';
    logoImg.className = 'dynaris-widget-footer-logo';
    footerLink.appendChild(logoImg);
  } else {
    footerLink.innerHTML = DYNARIS_MINI_LOGO;
  }
  footerLink.appendChild(document.createTextNode(' Dynaris'));
  footerInner.appendChild(footerLink);
  footer.appendChild(footerInner);

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'dynaris-widget-input-wrapper';
  inputWrapper.appendChild(privacyBanner);
  inputWrapper.appendChild(inputSection);

  panel.appendChild(header);
  panel.appendChild(messagesEl);
  panel.appendChild(inputWrapper);
  panel.appendChild(footer);

  container.appendChild(btn);
  container.appendChild(panel);

  privacyDismiss.addEventListener('click', () => {
    privacyBanner.classList.add('dynaris-widget-privacy-dismissed');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dynaris_widget_privacy_dismissed', '1');
    }
  });

  if (typeof localStorage !== 'undefined' && localStorage.getItem('dynaris_widget_privacy_dismissed') === '1') {
    privacyBanner.classList.add('dynaris-widget-privacy-dismissed');
  }

  const posMap = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px', right: 'auto' },
  };
  const pos = posMap[position] || posMap['bottom-right'];
  Object.assign(btn.style, pos);
  Object.assign(panel.style, { ...pos, bottom: '84px' });

  if (welcomeMessage) {
    appendMessage(messagesEl, {
      content: { body: welcomeMessage },
      direction: 'inbound',
    }, 'inbound', true);
  }

  return {
    container,
    btn,
    panel,
    messagesEl,
    input,
    sendBtn,
    minimizeBtn,
    config: { apiUrl, userId, title, subtitle, position, embedPageUrl },
  };
}

function parseMessageBody(msg) {
  const body = msg.content?.body ?? msg.content?.raw ?? String(msg.content ?? '');
  const div = document.createElement('div');
  div.className = 'dynaris-widget-msg-body';
  div.innerHTML = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return div;
}

export function appendMessage(messagesEl, msg, direction, isAgent = false) {
  const row = document.createElement('div');
  row.className = `dynaris-widget-msg-row dynaris-widget-msg-row-${direction}`;

  const avatar = document.createElement('div');
  avatar.className = 'dynaris-widget-msg-avatar';
  avatar.innerHTML = direction === 'inbound' || isAgent ? ICONS.sparkle : ICONS.user;

  const bubble = document.createElement('div');
  bubble.className = `dynaris-widget-msg dynaris-widget-msg-${direction}`;
  bubble.appendChild(parseMessageBody(msg));

  row.appendChild(avatar);
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
