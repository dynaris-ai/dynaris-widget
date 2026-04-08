import { init as widgetInit } from './widget.js';
import cssText from './styles.css?raw';

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  // Only needed in browser contexts (script-tag / direct DOM usage).
  if (typeof document === 'undefined') return;

  const styleEl = document.createElement('style');
  styleEl.setAttribute('type', 'text/css');
  styleEl.setAttribute('data-dynaris-widget-styles', 'true');
  styleEl.textContent = cssText;
  document.head.appendChild(styleEl);
}

injectStyles();

export { widgetInit as init };

function parseBoolean(value) {
  if (value === undefined) return undefined;
  const v = String(value).toLowerCase().trim();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return undefined;
}

function configFromScript(scriptEl) {
  const d = scriptEl.dataset;

  let usePolling = parseBoolean(d.usePolling);
  let useSse = parseBoolean(d.useSse);

  // Default to SSE streaming (polling is the fallback) when neither flag is provided.
  if (usePolling === undefined && useSse === undefined) useSse = true;

  return {
    apiKey: d.apiKey || undefined,
    userId: d.userId || undefined,
    apiUrl: d.apiUrl || undefined,
    title: d.title || undefined,
    subtitle: d.subtitle || undefined,
    welcomeMessage: d.welcomeMessage || undefined,
    privacyPolicyUrl: d.privacyPolicyUrl || undefined,
    poweredByUrl: d.poweredByUrl || undefined,
    poweredByLogoUrl: d.poweredByLogoUrl || undefined,
    headerLogoUrl: d.headerLogoUrl || undefined,
    logoUrl: d.logoUrl || undefined,
    embedPageUrl: d.embedPageUrl || undefined,
    voiceEnabled: parseBoolean(d.voiceEnabled),
    voiceAgentId: d.voiceAgentId || undefined,
    voiceParticipantName: d.voiceParticipantName || undefined,
    voiceSessionDurationMinutes: d.voiceSessionDurationMinutes
      ? Number(d.voiceSessionDurationMinutes)
      : undefined,
    voiceAgentName: d.voiceAgentName || undefined,
    voiceApiUrl: d.voiceApiUrl || undefined,
    voicePhoneNumber: d.voicePhoneNumber || undefined,
    voiceCallUrl: d.voiceCallUrl || undefined,
    voiceCallLabel: d.voiceCallLabel || undefined,
    progressHintText: d.progressHintText || d.progress_hint_text || undefined,
    progressHintUrl: d.progressHintUrl || d.progress_hint_url || undefined,
    position: d.position || undefined,
    usePolling,
    useSse,
    preChatForm: (() => {
      const en = parseBoolean(d.preChatForm);
      if (en !== true) return undefined;
      const labels = {
        firstName: d.preChatLabelFirstName || undefined,
        lastName: d.preChatLabelLastName || undefined,
        phoneNumber: d.preChatLabelPhoneNumber || undefined,
        email: d.preChatLabelEmail || undefined,
        description: d.preChatLabelDescription || undefined,
      };
      const hasLabel = Object.values(labels).some(Boolean);
      return {
        enabled: true,
        title: d.preChatFormTitle || undefined,
        submitLabel: d.preChatFormSubmitLabel || undefined,
        skipStorageKey: d.preChatFormSkipKey || undefined,
        ...(hasLabel ? { labels } : {}),
      };
    })(),
  };
}

// Script-tag embed support:
// <script src=".../dist/dynaris-widget.umd.cjs" data-dynaris-widget="true" data-user-id="..."></script>
if (typeof document !== 'undefined') {
  const scripts = document.querySelectorAll(
    'script[data-dynaris-widget="true"], script[data-dynaris-widget]'
  );

  scripts.forEach((scriptEl) => {
    const ctrl = widgetInit(configFromScript(scriptEl));
    // Keep a reference for debugging and to prevent accidental GC churn.
    scriptEl.__dynarisWidgetController = ctrl;
  });
}
