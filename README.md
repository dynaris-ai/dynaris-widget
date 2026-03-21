# @dynaris/widget

**Add an AI agent to any website. One script tag.**

A zero-dependency embeddable chat widget that connects your site to the [Dynaris](https://dynaris.ai) AI platform — the same pipeline powering WhatsApp, SMS, and every other Dynaris channel, now in a floating chat bubble on your page.

No frameworks. No backend to write. No configuration overhead. Drop it in and your users are talking to AI in under 2 minutes.

```html
<script
  src="https://unpkg.com/@dynaris/widget/dist/dynaris-widget.umd.cjs"
  data-dynaris-widget="true"
  data-user-id="YOUR_USER_ID"
  data-title="Chat with Us"
  data-welcome-message="Hi! How can I help you today?"
></script>
```

That's it. Seriously.

> **New to Dynaris?** Get your user ID and set up your AI agent at [dynaris.ai](https://dynaris.ai).

---

## Why This Widget

- **Zero dependencies** — pure ES modules, 35 KB, no runtime bloat
- **One file for script tag** — styles are inlined in the UMD build, nothing extra to load
- **Real-time by default** — SSE streaming with automatic polling fallback
- **File attachments** — users can paste images or attach files up to 5 MB
- **Session persistence** — conversation history survives page reloads via `localStorage`
- **Fully controllable** — programmatic `show()`, `hide()`, `send()`, `destroy()` API
- **TypeScript support** — type definitions included out of the box

---

## Install

**Script tag (zero setup):**
```html
<script
  src="https://unpkg.com/@dynaris/widget/dist/dynaris-widget.umd.cjs"
  data-dynaris-widget="true"
  data-user-id="YOUR_USER_ID"
  data-api-url="https://api.dynaris.ai"
  data-title="Chat with Us"
  data-subtitle="AI assistant"
  data-welcome-message="Hello! How can I help you today?"
  data-privacy-policy-url="https://yoursite.com/privacy"
  data-position="bottom-right"
></script>
```

**NPM:**
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
  userId: 'YOUR_USER_ID',
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
import { init } from '@dynaris/widget';

export function ChatWidget() {
  useEffect(() => {
    const ctrl = init({
      userId: process.env.NEXT_PUBLIC_DYNARIS_USER_ID,
      apiUrl: process.env.NEXT_PUBLIC_DYNARIS_API_URL,
      title: 'Chat Support',
      welcomeMessage: 'Hi! How can I help you?',
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
NEXT_PUBLIC_DYNARIS_USER_ID=your_user_id_here
NEXT_PUBLIC_DYNARIS_API_URL=https://api.dynaris.ai
```

---

## Configuration

All options work as `data-*` attributes (script tag) or keys in the config object (JS/NPM).

| Option | Data Attribute | JS Key | Default | Description |
|--------|---------------|--------|---------|-------------|
| User ID | `data-user-id` | `userId` | — | Your Dynaris user ID |
| API Key | `data-api-key` | `apiKey` | — | Sent as `X-Api-Key` header |
| API URL | `data-api-url` | `apiUrl` | `https://api.dynaris.ai` | Gateway base URL |
| Title | `data-title` | `title` | `Chat` | Agent name in the header |
| Subtitle | `data-subtitle` | `subtitle` | `Speak directly with our AI` | Text under the title |
| Welcome Message | `data-welcome-message` | `welcomeMessage` | — | First message shown on open. Supports `**bold**` |
| Privacy Policy URL | `data-privacy-policy-url` | `privacyPolicyUrl` | — | Adds a privacy link in the footer |
| Position | `data-position` | `position` | `bottom-right` | `bottom-right` or `bottom-left` |
| Use Polling | `data-use-polling` | `usePolling` | `false` | Force polling instead of SSE |

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

**Widget doesn't appear** — Check the browser console. Ensure `data-user-id` is set and the script loads (Network tab).

**No replies coming through** — Verify the gateway is running and `data-api-url` is correct. Try `data-use-polling="true"` — some proxies block SSE.

**SSE keeps reconnecting** — Set `proxy_buffering off` in nginx, or switch to polling mode. Check CORS headers on the gateway.

**Styles look broken** — For NPM/ESM use, ensure your bundler isn't tree-shaking the CSS. The UMD build has styles inlined — no separate CSS needed.

**Session resets on every load** — `localStorage` must be available. Some browsers block it in private/incognito mode.

---

## Release (maintainers)

**Registry policy:** npm does not allow republishing the same version. Unpublishing may be blocked if the package is old or heavily downloaded—see [unpublish policy](https://docs.npmjs.com/policies/unpublish).

**Resetting the public line to `1.0.0`:** If older prerelease-style tags exist (`1.0.1`, `1.0.2`, …), publishing `1.0.0` alone does **not** move `latest` (npm keeps `latest` on the highest semver). Remove the old tarballs first, then publish:

```bash
npm unpublish @dynaris/widget@1.0.3
npm unpublish @dynaris/widget@1.0.2
npm unpublish @dynaris/widget@1.0.1
pnpm build && pnpm test && pnpm publish
```

If unpublish is denied, use **`npm deprecate @dynaris/widget@"<2.0.0"`** and ship a new major (e.g. **`2.0.0`**) instead, or contact npm support.

`publishConfig.access` is **`public`**. Use ASCII `--` in the shell, not `—`. Run publish from this repo root.

## Contributing

1. Fork and create a feature branch: `git checkout -b feat/my-feature`
2. Make changes in `src/`. Keep production dependencies at zero.
3. Test locally with `pnpm dev` against a running gateway — test both SSE and polling modes.
4. Build and verify: `pnpm build`
5. Open a PR against `main`.

---

## Powered by Dynaris

This widget is the frontend for the [Dynaris](https://dynaris.ai) AI platform — a multi-agent orchestration system that can automate workflows across your entire software stack. The same AI that responds in this chat can connect to your CRM, send emails, update Jira tickets, and more.

[Get started at dynaris.ai →](https://dynaris.ai)
