/**
 * Pre-chat lead form (first name, last name, phone, email, description).
 * Shown as a full-panel overlay until submitted; maps to gateway POST /api/chat-widget/contact.
 */

const DEFAULT_LABELS = {
  firstName: 'First name',
  lastName: 'Last name',
  phoneNumber: 'Phone number',
  email: 'Email',
  description: 'Description',
};

const DEFAULT_REQUIRED_FIELDS = {
  firstName: true,
  lastName: true,
  phoneNumber: true,
  email: true,
  description: true,
};

function pickLabelPair(obj, camelKey, snakeKey, fallback) {
  const a = obj[camelKey];
  const b = obj[snakeKey];
  if (typeof a === 'string' && a.trim() !== '') return a.trim();
  if (typeof b === 'string' && b.trim() !== '') return b.trim();
  return fallback;
}

function normalizeLabels(raw) {
  const L = raw && typeof raw === 'object' ? raw : {};
  return {
    firstName: pickLabelPair(L, 'firstName', 'first_name', DEFAULT_LABELS.firstName),
    lastName: pickLabelPair(L, 'lastName', 'last_name', DEFAULT_LABELS.lastName),
    phoneNumber: pickLabelPair(L, 'phoneNumber', 'phone_number', DEFAULT_LABELS.phoneNumber),
    email: pickLabelPair(L, 'email', 'email', DEFAULT_LABELS.email),
    description: pickLabelPair(L, 'description', 'description', DEFAULT_LABELS.description),
  };
}

function normalizeRequiredFields(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const pick = (camelKey, snakeKey, fallback) => {
    const a = r[camelKey];
    const b = r[snakeKey];
    if (typeof a === 'boolean') return a;
    if (typeof b === 'boolean') return b;
    return fallback;
  };
  return {
    firstName: pick('firstName', 'first_name', DEFAULT_REQUIRED_FIELDS.firstName),
    lastName: pick('lastName', 'last_name', DEFAULT_REQUIRED_FIELDS.lastName),
    phoneNumber: pick('phoneNumber', 'phone_number', DEFAULT_REQUIRED_FIELDS.phoneNumber),
    email: pick('email', 'email', DEFAULT_REQUIRED_FIELDS.email),
    description: pick('description', 'description', DEFAULT_REQUIRED_FIELDS.description),
  };
}

function coalescePreChatField(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'string') return v;
  return '';
}

function normalizeDefaultValues(raw) {
  const d = raw && typeof raw === 'object' ? raw : {};
  const pick = (camelKey, snakeKey) => {
    const a = d[camelKey];
    const b = d[snakeKey];
    const av = coalescePreChatField(a);
    const bv = coalescePreChatField(b);
    if (av.trim() !== '') return av;
    if (bv.trim() !== '') return bv;
    return '';
  };
  return {
    firstName: pick('firstName', 'first_name'),
    lastName: pick('lastName', 'last_name'),
    phoneNumber: pick('phoneNumber', 'phone_number'),
    email: pick('email', 'email'),
    description: pick('description', 'description'),
  };
}

function safeDecodeParam(raw) {
  const s = String(raw ?? '');
  if (s === '') return '';
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  } catch {
    return s;
  }
}

/**
 * Read `?first_name=...&email=...` (camelCase keys also) for pre-chat prefill.
 */
export function readPreChatDefaultsFromLocation() {
  if (typeof window === 'undefined' || !window.location?.search) {
    return normalizeDefaultValues({});
  }
  const params = new URLSearchParams(window.location.search);
  const get = (camel, snake) => {
    const raw = params.get(snake) ?? params.get(camel);
    if (raw === null || raw === '') return '';
    return safeDecodeParam(raw);
  };
  return {
    firstName: get('firstName', 'first_name'),
    lastName: get('lastName', 'last_name'),
    phoneNumber: get('phoneNumber', 'phone_number'),
    email: get('email', 'email'),
    description: get('description', 'description'),
  };
}

function mergePreChatDefaultValues(fromConfig, fromUrl) {
  const keys = ['firstName', 'lastName', 'phoneNumber', 'email', 'description'];
  const out = {};
  for (const k of keys) {
    const cfg = coalescePreChatField(fromConfig[k]).trim();
    const url = coalescePreChatField(fromUrl[k]).trim();
    out[k] = cfg !== '' ? cfg : url;
  }
  return out;
}

function normalizePreChatConfig(raw) {
  const p = raw && typeof raw === 'object' ? raw : {};
  const enabled = Boolean(p.enabled);
  const title =
    typeof p.title === 'string' && p.title.trim() !== ''
      ? p.title.trim()
      : 'Before we start';
  const submitLabel =
    typeof p.submitLabel === 'string' && p.submitLabel.trim() !== ''
      ? p.submitLabel.trim()
      : 'Continue';
  const skipStorageKey =
    typeof p.skipStorageKey === 'string' && p.skipStorageKey.trim() !== ''
      ? p.skipStorageKey.trim()
      : null;
  const labels = normalizeLabels(p.labels);
  const requiredFields = normalizeRequiredFields(
    p.requiredFields ?? p.required_fields
  );
  const prefillFromQuery =
    p.prefillFromQuery !== false && p.prefill_from_query !== false;
  const fromConfig = normalizeDefaultValues(
    p.defaultValues ?? p.default_values ?? p
  );
  const fromUrl = prefillFromQuery ? readPreChatDefaultsFromLocation() : normalizeDefaultValues({});
  const defaultValues = mergePreChatDefaultValues(fromConfig, fromUrl);
  return {
    enabled,
    title,
    submitLabel,
    skipStorageKey,
    labels,
    requiredFields,
    defaultValues,
    prefillFromQuery,
  };
}

export function shouldSkipPreChatFromStorage(skipStorageKey) {
  if (!skipStorageKey || typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(`dynaris_widget_prechat_${skipStorageKey}`) === '1';
  } catch (_) {
    return false;
  }
}

export function markPreChatCompleteInStorage(skipStorageKey) {
  if (!skipStorageKey || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`dynaris_widget_prechat_${skipStorageKey}`, '1');
  } catch (_) {}
}

export { normalizePreChatConfig };

/**
 * @param {HTMLElement} panel
 * @param {ReturnType<normalizePreChatConfig>} cfg
 * @param {{ onSubmit: (payload: object) => Promise<void>; onSuccess: () => void; onError: (err: Error) => void }} callbacks
 */
export function mountPreChatForm(panel, cfg, callbacks) {
  const root = document.createElement('div');
  root.className = 'dynaris-widget-prechat';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'dynaris-prechat-title');

  const inner = document.createElement('div');
  inner.className = 'dynaris-widget-prechat-inner';

  const h = document.createElement('h2');
  h.id = 'dynaris-prechat-title';
  h.className = 'dynaris-widget-prechat-title';
  h.textContent = cfg.title;

  const form = document.createElement('form');
  form.className = 'dynaris-widget-prechat-form';
  form.noValidate = true;

  const fields = [
    { key: 'firstName', name: 'first_name', type: 'text', label: cfg.labels.firstName, autocomplete: 'given-name', required: cfg.requiredFields.firstName },
    { key: 'lastName', name: 'last_name', type: 'text', label: cfg.labels.lastName, autocomplete: 'family-name', required: cfg.requiredFields.lastName },
    { key: 'phoneNumber', name: 'phone_number', type: 'tel', label: cfg.labels.phoneNumber, autocomplete: 'tel', required: cfg.requiredFields.phoneNumber },
    { key: 'email', name: 'email', type: 'email', label: cfg.labels.email, autocomplete: 'email', required: cfg.requiredFields.email },
    { key: 'description', name: 'description', type: 'textarea', label: cfg.labels.description, autocomplete: 'off', required: cfg.requiredFields.description },
  ];

  const inputs = {};

  for (const f of fields) {
    const wrap = document.createElement('div');
    wrap.className = 'dynaris-widget-prechat-field';
    const lab = document.createElement('label');
    lab.className = 'dynaris-widget-prechat-label';
    lab.htmlFor = `dynaris-prechat-${f.key}`;
    lab.textContent = f.label;
    let control;
    if (f.type === 'textarea') {
      control = document.createElement('textarea');
      control.className = 'dynaris-widget-prechat-textarea';
      control.rows = 3;
    } else {
      control = document.createElement('input');
      control.className = 'dynaris-widget-prechat-input';
      control.type = f.type;
    }
    control.id = `dynaris-prechat-${f.key}`;
    control.name = f.name;
    control.required = f.required;
    if (f.autocomplete) control.setAttribute('autocomplete', f.autocomplete);
    const presetText = coalescePreChatField(cfg.defaultValues[f.key]).trim();
    if (presetText.length > 0) {
      control.value = presetText;
    }
    inputs[f.key] = control;
    wrap.appendChild(lab);
    wrap.appendChild(control);
    form.appendChild(wrap);
  }

  const err = document.createElement('div');
  err.className = 'dynaris-widget-prechat-error';
  err.setAttribute('aria-live', 'polite');

  const actions = document.createElement('div');
  actions.className = 'dynaris-widget-prechat-actions';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'dynaris-widget-prechat-submit';
  submitBtn.textContent = cfg.submitLabel;
  actions.appendChild(submitBtn);

  form.appendChild(err);
  form.appendChild(actions);

  inner.appendChild(h);
  inner.appendChild(form);
  root.appendChild(inner);
  panel.appendChild(root);

  function setBusy(busy) {
    submitBtn.disabled = busy;
    Object.values(inputs).forEach((el) => {
      el.disabled = busy;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const firstName = String(inputs.firstName.value || '').trim();
    const lastName = String(inputs.lastName.value || '').trim();
    const phoneNumber = String(inputs.phoneNumber.value || '').trim();
    const email = String(inputs.email.value || '').trim();
    const description = String(inputs.description.value || '').trim();
    const missingRequiredField = fields.some((field) => {
      if (!field.required) return false;
      return String(inputs[field.key].value || '').trim() === '';
    });
    if (missingRequiredField) {
      err.textContent = 'Please fill in all fields.';
      return;
    }
    setBusy(true);
    try {
      await callbacks.onSubmit({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || undefined,
        email,
        description,
      });
      root.remove();
      callbacks.onSuccess();
    } catch (submitErr) {
      const msg =
        submitErr && typeof submitErr === 'object' && 'message' in submitErr
          ? String(submitErr.message)
          : 'Something went wrong. Please try again.';
      err.textContent = msg;
      callbacks.onError(submitErr instanceof Error ? submitErr : new Error(msg));
    } finally {
      setBusy(false);
    }
  });

  requestAnimationFrame(() => {
    inputs.firstName.focus();
  });

  return {
    root,
    destroy() {
      if (root.parentNode) root.remove();
    },
  };
}

export function setComposerBlocked(els, blocked) {
  const {
    input,
    sendBtn,
    addBtn,
    dictationBtn,
    fileInput,
    voiceControl,
  } = els;
  if (input) {
    input.disabled = blocked;
    input.setAttribute('aria-disabled', blocked ? 'true' : 'false');
  }
  if (sendBtn) sendBtn.disabled = blocked;
  if (addBtn) addBtn.disabled = blocked;
  if (dictationBtn) dictationBtn.disabled = blocked;
  if (fileInput) fileInput.disabled = blocked;
  if (voiceControl && 'disabled' in voiceControl) {
    voiceControl.disabled = blocked;
  }
}
