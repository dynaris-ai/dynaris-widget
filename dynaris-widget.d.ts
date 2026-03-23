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
  /** Enables in-widget browser voice mode using LiveKit instead of external `tel:` or website links. */
  voiceEnabled?: boolean;
  /** Voice agent configuration id used by the widget voice session proxy. */
  voiceAgentId?: string;
  /** Optional participant name shown in the LiveKit room. */
  voiceParticipantName?: string;
  /** Optional session duration for the browser voice token. Default 60. */
  voiceSessionDurationMinutes?: number;
  /** Optional LiveKit worker name override used by the backend session proxy. */
  voiceAgentName?: string;
  /** Optional override for the voice API base URL; defaults to `apiUrl`. */
  voiceApiUrl?: string;
  /**
   * Digits for `tel:` when `voiceCallUrl` is not set (e.g. US `7867553623`, `+17867553623`).
   * Host apps often use `process.env.NEXT_PUBLIC_VOICE_AI_PHONE`.
   */
  voicePhoneNumber?: string;
  /**
   * When set, the header voice control links here (e.g. your marketing `/contact` or `/voice` page)
   * instead of using `tel:` — same pattern as “call from the website” without showing a raw number in the widget.
   * Opens in a new tab. If omitted, `voicePhoneNumber` is used for `tel:`.
   */
  voiceCallUrl?: string;
  /** Header CTA label; default `Call our voice AI`. The phone number is not shown in the UI (only in `aria-label` when using `tel:`). */
  voiceCallLabel?: string;
}

export interface ChatWidgetController {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  send: (text: string) => void;
  destroy: () => void;
}

export function init(config?: ChatWidgetConfig): ChatWidgetController | null;
