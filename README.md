# @dynaris/widget

**Add an AI chat + voice agent to any website. One script tag.**

[![npm version](https://img.shields.io/npm/v/@dynaris/widget)](https://www.npmjs.com/package/@dynaris/widget)
[![npm downloads](https://img.shields.io/npm/dm/@dynaris/widget)](https://www.npmjs.com/package/@dynaris/widget)
[![license](https://img.shields.io/npm/l/@dynaris/widget)](https://github.com/dynaris-ai/dynaris-widget/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@dynaris/widget)](https://bundlephobia.com/package/@dynaris/widget)

An embeddable AI chat widget that connects your website to the [Dynaris](https://dynaris.ai) platform — the same multi-agent pipeline powering WhatsApp, SMS, and voice channels, now as a floating chat bubble on your page. Optional **in-browser voice mode** lets users speak directly to your AI agent using LiveKit WebRTC.

No frameworks. No backend to write. No configuration overhead. Drop it in and your users are talking to AI in under 2 minutes.

```html
<script
  src="https://unpkg.com/@dynaris/widget/dist/dynaris-widget.umd.cjs"
  data-dynaris-widget="true"
  data-api-key="YOUR_API_KEY"
  data-title="Chat with Us"
  data-welcome-message="Hi! How can I help you today?"
></script>
```

That's it. Seriously.

> **New to Dynaris?** Get your API key and set up your AI agent at [dynaris.ai](https://dynaris.ai).

---

## Features

- **Zero runtime dependencies** — pure ES modules, ~35 KB gzipped, no React/Vue required
- **One file for script tag** — styles inlined in the UMD build, nothing extra to load
- **In-browser voice AI** — real-time voice sessions via LiveKit WebRTC (opt-in, see [Voice Mode](#voice-mode))
- **Real-time streaming** — SSE with automatic polling fallback; works behind any proxy
- **File attachments** — users can paste images or attach files up to 5 MB
- **Session persistence** — conversation history survives page reloads via `localStorage`
- **Programmatic API** — `show()`, `hide()`, `send()`, `showWithVoice()`, `destroy()`
- **TypeScript support** — type definitions included
- **Framework agnostic** — works with React, Next.js, Vue, Svelte, or plain HTML

---

## Install

**Script tag (zero setup):**
```html
<script
  src="https://unpkg.com/@dynaris/widget/dist/dynaris-widget.umd.cjs"
  data-dynaris-widget="true"
  data-api-key="YOUR_API_KEY"
  data-api-url="https://api.dynaris.ai"
  data-title="Chat with Us"
  data-subtitle="AI assistant"
  data-welcome-message="Hello! How can I help you today?"
  data-privacy-policy-url="https://yoursite.com/privacy"
  data-position="bottom-right"
></script>
```

**NPM / pnpm:**
```bash
npm install @dynaris/widget
# or
pnpm add @dynaris/widget
```

---

## Integration

### JavaScript / ES Module

```js
import { init } from '@dynaris/widget';

const controller = init({
  apiKey: 'YOUR_API_KEY',
  apiUrl: 'https://api.dynaris.ai',
  title: 'Chat Support',
  subtitle: 'AI assistant',
  welcomeMessage: 'Welcome! How can I help you?',
  privacyPolicyUrl: 'https://yoursite.com/privacy',
  position: 'bottom-right',
});

// Programmatic control
controller.show();
controller.hide();
controller.toggle();
controller.send('Hello!');
controller.destroy();
```

### React / Next.js

```jsx
// components/ChatWidget.jsx
import { useEffect } from 'react';

export function ChatWidget() {
  useEffect(() => {
    let ctrl;
    import('@dynaris/widget').then(({ init }) => {
      ctrl = init({
        apiKey: process.env.NEXT_PUBLIC_DYNARIS_API_KEY,
        apiUrl: process.env.NEXT_PUBLIC_DYNARIS_API_URL,
        title: 'Chat Support',
        welcomeMessage: 'Hi! How can I help you?',
      });
    });
    return () => ctrl?.destroy();
  }, []);

  return null;
}
```

Add to your root layout:

```jsx
// app/layout.jsx
import { ChatWidget } from '@/components/ChatWidget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
```

`.env.local`:
```env
NEXT_PUBLIC_DYNARIS_API_KEY=your_api_key_here
NEXT_PUBLIC_DYNARIS_API_URL=https://api.dynaris.ai
```

---

## Voice Mode

The widget supports **in-browser voice sessions** powered by LiveKit WebRTC. Users click a microphone button in the chat header to start a real-time voice conversation with your AI agent — no phone number, no external app, no redirect.

### Enable voice (script tag)
```html
<script
  src="https://unpkg.com/@dynaris/widget/dist/dynaris-widget.umd.cjs"
  data-dynaris-widget="true"
  data-api-key="YOUR_API_KEY"
  data-voice-enabled="true"
  data-voice-agent-id="YOUR_VOICE_AGENT_ID"
  data-voice-call-label="Talk to our AI"
></script>
```

### Enable voice (JS/NPM)
```js
import { init } from '@dynaris/widget';

const controller = init({
  apiKey: 'YOUR_API_KEY',
  voiceEnabled: true,
  voiceAgentId: 'YOUR_VOICE_AGENT_ID',
  voiceCallLabel: 'Talk to our AI',
  voiceParticipantName: 'Website Visitor',  // optional
});

// Programmatically open and immediately start a voice session
controller.showWithVoice();
```

### Voice configuration options

| Option | Data Attribute | JS Key | Description |
|--------|---------------|--------|-------------|
| Enable voice | `data-voice-enabled` | `voiceEnabled` | Show the voice button in the header |
| Voice agent ID | `data-voice-agent-id` | `voiceAgentId` | Your Dynaris voice agent configuration ID |
| Call label | `data-voice-call-label` | `voiceCallLabel` | Header CTA text (default: `Call our voice AI`) |
| Participant name | `data-voice-participant-name` | `voiceParticipantName` | Name shown in the LiveKit room |
| Voice API URL | `data-voice-api-url` | `voiceApiUrl` | Override voice API base URL (defaults to `apiUrl`) |
| Agent name | `data-voice-agent-name` | `voiceAgentName` | LiveKit worker name override |
| Session duration | `data-voice-session-duration-minutes` | `voiceSessionDurationMinutes` | Browser voice token duration in minutes (default: 60) |
| Phone number | `data-voice-phone-number` | `voicePhoneNumber` | Fallback `tel:` number if not using browser voice |
| Call URL | `data-voice-call-url` | `voiceCallUrl` | Link to a `/voice` page instead of `tel:` |

---

## Configuration

All options work as `data-*` attributes (script tag) or keys in the config object (JS/NPM).

| Option | Data Attribute | JS Key | Default | Description |
|--------|---------------|--------|---------|-------------|
| API Key | `data-api-key` | `apiKey` | — | Sent as `X-Api-Key` header (preferred) |
| User ID | `data-user-id` | `userId` | — | Legacy: userId when apiKey not used |
| API URL | `data-api-url` | `apiUrl` | `https://api.dynaris.ai` | Gateway base URL |
| Title | `data-title` | `title` | `Chat` | Agent name in the header |
| Subtitle | `data-subtitle` | `subtitle` | `Speak directly with our AI` | Text under the title |
| Welcome Message | `data-welcome-message` | `welcomeMessage` | — | First message shown on open. Supports `**bold**` |
| Privacy Policy URL | `data-privacy-policy-url` | `privacyPolicyUrl` | — | Adds a privacy link in the footer |
| Logo URL | `data-logo-url` | `logoUrl` | — | Chat bubble / launcher icon |
| Header Logo URL | `data-header-logo-url` | `headerLogoUrl` | — | Logo in the widget header bar |
| Position | `data-position` | `position` | `bottom-right` | `bottom-right` or `bottom-left` |
| Viewer | `data-viewer` | `viewer` | `embed` | `embed` (floating) or `mobile-app` (full-viewport WebView) |
| Use Polling | `data-use-polling` | `usePolling` | `false` | Force polling instead of SSE |
| Hide Powered By | `data-hide-powered-by` | `hidePoweredBy` | `false` | Hide the Dynaris footer mark |

---

## Build Output

| File | Format | Use Case |
|------|--------|---------|
| `dist/dynaris-widget.es.js` | ESM | Bundlers (Vite, Next.js, Webpack) |
| `dist/dynaris-widget.umd.cjs` | UMD | `<script>` tag — styles inlined, single file |

---

## Development

**Prerequisites:** Node.js 18+, pnpm 10+, gateway server running on `localhost:3001`

```bash
git clone https://github.com/dynaris-ai/dynaris-widget.git
cd dynaris-widget
pnpm install
pnpm dev       # http://localhost:5173 — live reload
pnpm build     # produces dist/
pnpm preview   # serve the production build
pnpm test      # run unit tests
```

### Project Structure

```
src/
├── index.js      # Entry point — reads data attrs, auto-initializes
├── widget.js     # Core logic: messaging, SSE/polling, lifecycle
├── ui.js         # DOM construction and rendering
├── api.js        # HTTP + SSE gateway client
├── session.js    # Session persistence via localStorage
└── styles.css    # All styles (inlined in UMD build)
```

---

## API Contract

The widget talks to three gateway endpoints. All requests include a `session_id` (UUID persisted in `localStorage`).

### `POST /api/chat-widget/message`

```json
{
  "user_id": "string",
  "session_id": "string",
  "message": "string",
  "attachments": [{ "name": "file.pdf", "type": "application/pdf", "data": "<base64>" }]
}
```

### `GET /api/chat-widget/messages`

Query params: `user_id`, `session_id`, `after` (last seen message ID)

```json
{
  "messages": [{ "id": "string", "direction": "inbound", "content": "Hello!", "createdAt": "..." }]
}
```

### `GET /api/chat-widget/sse`

Query params: `user_id`, `session_id`

```
event: chat_new_message
data: {"type":"chat_new_message","data":{"message":{"id":"...","content":"Hello!","direction":"inbound"}}}
```

---

## Troubleshooting

**Widget doesn't appear** — Check the browser console. Ensure `data-api-key` is set and the script loads (Network tab).

**No replies coming through** — Verify the gateway is running and `data-api-url` is correct. Try `data-use-polling="true"` — some proxies block SSE.

**SSE keeps reconnecting** — Set `proxy_buffering off` in nginx, or switch to polling mode. Check CORS headers on the gateway.

**Styles look broken** — For NPM/ESM use, ensure your bundler isn't tree-shaking the CSS. The UMD build has styles inlined — no separate CSS needed.

**Session resets on every load** — `localStorage` must be available. Some browsers block it in private/incognito mode.

**Voice doesn't connect** — Ensure `voiceEnabled: true` and a valid `voiceAgentId` are set. Check that the gateway has LiveKit configured and CORS allows your origin.

---

## Release (maintainers)

**Registry policy:** npm does not allow republishing the same version. Unpublishing may be blocked if the package is old or heavily downloaded — see [unpublish policy](https://docs.npmjs.com/policies/unpublish).

```bash
pnpm build && pnpm test && pnpm publish
```

`publishConfig.access` is **`public`**. Run publish from this repo root.

---

## Contributing

1. Fork and create a feature branch: `git checkout -b feat/my-feature`
2. Make changes in `src/`. Keep production dependencies minimal.
3. Test locally with `pnpm dev` against a running gateway — test both SSE and polling modes.
4. Build and verify: `pnpm build && pnpm test`
5. Open a PR against `main`.

---

## Powered by Dynaris

This widget is the browser frontend for the [Dynaris](https://dynaris.ai) AI platform — a multi-agent orchestration system that automates workflows across your entire stack. The same AI that responds in this chat can connect to your CRM, send emails, update Jira tickets, handle voice calls, and more.

[Get started at dynaris.ai →](https://dynaris.ai)
