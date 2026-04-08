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
  /**
   * First text bubble above the floating launcher; defaults to `title` (e.g. “Chat with us”).
   * snake_case: `launcher_hint_chat`.
   */
  launcherHintChat?: string;
  launcher_hint_chat?: string;
  /**
   * Second bubble when any voice entry point exists (LiveKit, `tel:`, or `voiceCallUrl`).
   * Default: “Speak with our AI”. snake_case: `launcher_hint_voice`.
   */
  launcherHintVoice?: string;
  launcher_hint_voice?: string;
  /**
   * Outbound chat message sent when the chat launcher bubble is clicked (after the panel opens).
   * snake_case: `launcher_hint_chat_question`.
   */
  launcherHintChatQuestion?: string;
  launcher_hint_chat_question?: string;
  /**
   * Optional outbound message sent before the voice launcher continues into voice.
   * When omitted, the voice bubble just opens the voice route after pre-chat.
   * snake_case: `launcher_hint_voice_question`.
   */
  launcherHintVoiceQuestion?: string;
  launcher_hint_voice_question?: string;
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
  /**
   * Optional line shown in a bubble above the typing indicator while the assistant is working.
   * With `progressHintUrl`, renders as a link (new tab). Otherwise a button that dispatches
   * `dynaris-widget:progress-hint-click` and calls `onProgressHintClick` when provided.
   */
  progressHintText?: string;
  progressHintUrl?: string;
  onProgressHintClick?: () => void;
  /**
   * When enabled, shows a fixed lead form (first name, last name, phone, email, description)
   * before chat or in-widget voice. Submits to `POST /api/chat-widget/contact` (maps to CRM `workflows.contacts`).
   */
  preChatForm?: {
    enabled: boolean;
    title?: string;
    submitLabel?: string;
    /** If set, successful submit sets localStorage so the form is not shown again in this browser. */
    skipStorageKey?: string;
    /**
     * Initial field values; snake_case keys (`first_name`, etc.) are also accepted.
     * Numbers are coerced to string. These override the same keys from the page query string when both are set.
     */
    defaultValues?: {
      firstName?: string | number;
      lastName?: string | number;
      phoneNumber?: string | number;
      email?: string | number;
      description?: string | number;
    };
    /** When true (default), also reads `?first_name=&last_name=&phone_number=&email=&description=` from the URL. */
    prefillFromQuery?: boolean;
    prefill_from_query?: boolean;
    /** Per-field required toggles. Omitted fields default to `true`. */
    requiredFields?: {
      firstName?: boolean;
      lastName?: boolean;
      phoneNumber?: boolean;
      email?: boolean;
      description?: boolean;
      first_name?: boolean;
      last_name?: boolean;
      phone_number?: boolean;
    };
    required_fields?: {
      firstName?: boolean;
      lastName?: boolean;
      phoneNumber?: boolean;
      email?: boolean;
      description?: boolean;
      first_name?: boolean;
      last_name?: boolean;
      phone_number?: boolean;
    };
    labels?: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      email?: string;
      description?: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string;
    };
  };
}

export interface ChatWidgetController {
  show: () => void;
  /** Opens the widget panel and immediately starts a voice session. */
  showWithVoice: () => Promise<void>;
  hide: () => void;
  toggle: () => void;
  send: (text: string) => void;
  destroy: () => void;
}

export function init(config?: ChatWidgetConfig): ChatWidgetController | null;
