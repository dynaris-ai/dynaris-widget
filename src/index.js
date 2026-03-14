import styles from './styles.css?inline';
import { init } from './widget.js';

function injectStyles() {
  if (typeof document === 'undefined') return;
  const id = 'dynaris-widget-styles';
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = styles;
  document.head.appendChild(el);
}

function initFromScript() {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    const src = s.getAttribute('src') || '';
    if (src.includes('dynaris-widget') || s.getAttribute('data-dynaris-widget') === 'true') {
      const userId = s.getAttribute('data-user-id');
      const apiUrl = s.getAttribute('data-api-url');
      const title = s.getAttribute('data-title');
      const subtitle = s.getAttribute('data-subtitle');
      const welcomeMessage = s.getAttribute('data-welcome-message');
      const privacyPolicyUrl = s.getAttribute('data-privacy-policy-url');
      const usePolling = s.getAttribute('data-use-polling') === 'true' || s.getAttribute('data-use-polling') === '1';
      const position = s.getAttribute('data-position');
      if (userId) {
        init({
          userId,
          apiUrl: apiUrl || undefined,
          title: title || undefined,
          subtitle: subtitle || undefined,
          welcomeMessage: welcomeMessage || undefined,
          privacyPolicyUrl: privacyPolicyUrl || undefined,
          usePolling,
          position: position || undefined,
        });
      }
      break;
    }
  }
}

if (typeof window !== 'undefined') {
  injectStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFromScript);
  } else {
    initFromScript();
  }
}

export { init };
export default init;
