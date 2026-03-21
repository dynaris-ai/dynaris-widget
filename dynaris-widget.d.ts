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
  /** API key for gateway auth (from dynaris-web). When set, userId is resolved server-side. */
  apiKey?: string;
  /** Legacy: userId when apiKey not used (same-origin or proxy). */
  userId?: string;
  apiUrl?: string;
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  privacyPolicyUrl?: string;
  poweredByUrl?: string;
  /**
   * Optional custom image URL for the powered-by mark. When omitted, the widget inlines the
   * bundled Dynaris mark (same SVG as `website/public/dynaris.svg`), sized via CSS — no host `/public` asset required.
   */
  poweredByLogoUrl?: string;
  headerLogoUrl?: string;
  logoUrl?: string;
  embedPageUrl?: string;
  menuConfig?: ChatWidgetMenuConfig;
  usePolling?: boolean;
  useSse?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  /**
   * `embed` — floating launcher + panel (default).
   * `mobile-app` — full-viewport panel for in-app WebViews; safe-area aware; back posts `dynaris-widget:close`.
   */
  viewer?: 'embed' | 'mobile-app';
  /** When false, shows footer even in mobile-app viewer. Default: hidden for mobile-app only. */
  hidePoweredBy?: boolean;
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
