/**
 * 3-dots menu configuration. Each item can be enabled/disabled and optionally
 * customized with a label. addChatToWebsite supports a url for the embed page.
 */
export interface ChatWidgetMenuConfig {
  sendTranscript?: { enabled?: boolean; label?: string };
  addChatToWebsite?: { enabled?: boolean; url?: string; label?: string };
  sound?: { enabled?: boolean; label?: string };
}

export interface ChatWidgetConfig {
  userId: string;
  apiUrl?: string;
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  privacyPolicyUrl?: string;
  poweredByUrl?: string;
  poweredByLogoUrl?: string;
  headerLogoUrl?: string;
  logoUrl?: string;
  embedPageUrl?: string;
  menuConfig?: ChatWidgetMenuConfig;
  usePolling?: boolean;
  useSse?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  stylesUrl?: string;
}

export interface ChatWidgetController {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  send: (text: string) => void;
  destroy: () => void;
}

export function init(config?: ChatWidgetConfig): ChatWidgetController | null;
