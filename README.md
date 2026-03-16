# Dynaris Widget

An embeddable, zero-dependency chat widget that adds AI-powered chat to any website. It connects to the Dynaris gateway server via the `web_widget` channel, delivering the same pipeline used across WhatsApp and other Dynaris channels.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Configuration](#configuration)
- [Integration](#integration)
  - [Script Tag](#script-tag)
  - [NPM / ES Module](#npm--es-module)
  - [React / Next.js](#react--nextjs)
- [Build Output](#build-output)
- [Publishing & Distribution](#publishing--distribution)
- [API Contract](#api-contract)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features

- Drop-in chat widget via a single `<script>` tag or NPM import
- Real-time messages via **SSE** (Server-Sent Events), with polling fallback
- File & image attachments (paste or file picker, up to 5 MB)
- Welcome message with **bold** markdown support
- Sound notifications with in-widget toggle
- Session persistence via `localStorage`
- Configurable position, title, subtitle, and privacy policy link
- TypeScript type definitions included
- Zero production dependencies — pure ES modules

---

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 18+ | Required by Vite |
| pnpm | 10+ | `npm install -g pnpm` |
| Gateway Server | — | Must implement the [chat widget API](#api-contract) |

> The widget talks to the **gateway-server**. For local end-to-end testing you need the gateway running on `http://localhost:3001`.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dynaris-ai/dynaris-widget.git
cd dynaris-widget
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The demo page uses:

- `userId: 'demo-user-id'`
- `apiUrl: 'http://localhost:3001'`

Make sure the gateway-server is running locally and has the chat widget routes implemented.

### 4. Build for production

```bash
pnpm build
```

Output files land in `dist/`. See [Build Output](#build-output) for details.

---

## Development

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `pnpm dev` | Starts Vite dev server with HMR on port 5173 |
| Build | `pnpm build` | Produces ESM + UMD bundles in `dist/` |
| Preview | `pnpm preview` | Serves the production build locally |

### Project Structure

```
dynaris-widget/
├── src/
│   ├── index.js           # Entry point — reads script-tag data attrs, auto-initializes
│   ├── widget.js          # Core widget logic: message handling, polling/SSE, sound
│   ├── ui.js              # DOM construction and rendering
│   ├── api.js             # HTTP + SSE communication with gateway
│   ├── session.js         # Persistent session ID via localStorage
│   └── styles.css         # All widget styles (inlined in UMD build)
├── dynaris-widget.d.ts    # TypeScript type definitions
├── vite.config.js         # Vite build configuration
├── index.html             # Dev demo (ES module import)
├── embed.html             # Dev demo (script tag embed)
└── package.json
```

### Key Modules

- **`src/widget.js`** — `init(config)` is the main export. Manages lifecycle, SSE/polling, and the controller API returned to callers.
- **`src/ui.js`** — Builds the full widget DOM tree. Call `createWidget()` to get the root element and all sub-component references.
- **`src/api.js`** — Thin HTTP client. All gateway calls live here so they're easy to swap out.
- **`src/session.js`** — `getOrCreateSessionId()` reads/writes `dynaris_widget_session_id` in `localStorage`.

---

## Configuration

All options can be set via **data attributes** (script tag) or a **config object** (JS/NPM).

| Option | Data Attribute | JS Key | Required | Default | Description |
|--------|---------------|--------|----------|---------|-------------|
| User ID | `data-user-id` | `userId` | **Yes** | — | Dynaris account user ID (site owner) |
| API URL | `data-api-url` | `apiUrl` | No | `https://api.dynaris.ai` | Gateway base URL |
| Title | `data-title` | `title` | No | `Text Support` | Agent name shown in header |
| Subtitle | `data-subtitle` | `subtitle` | No | `AI assistant` | Text under the agent name |
| Welcome Message | `data-welcome-message` | `welcomeMessage` | No | — | First AI message shown on open. Supports `**bold**` |
| Privacy Policy URL | `data-privacy-policy-url` | `privacyPolicyUrl` | No | — | Adds a Privacy Policy link in the widget footer |
| Use Polling | `data-use-polling` | `usePolling` | No | `false` | `true` to use polling instead of SSE |
| Position | `data-position` | `position` | No | `bottom-right` | `bottom-right` or `bottom-left` |
| API Key | `data-api-key` | `apiKey` | No | — | Sent as `X-Api-Key` header if provided |

---

## Integration

### Script Tag

The simplest way — add a single tag before `</body>`. Styles are bundled into the UMD file.

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
  data-use-polling="false"
  data-position="bottom-right"
></script>
```

> **Self-hosting:** Copy `dist/dynaris-widget.umd.cjs` to your CDN/static host and change the `src` to your URL for full control.

---

### NPM / ES Module

```bash
pnpm add @dynaris/widget
# or
npm install @dynaris/widget
```

```js
import { init } from '@dynaris/widget';

const controller = init({
  userId: 'YOUR_USER_ID',
  apiUrl: 'https://api.dynaris.ai',
  title: 'Text Support',
  subtitle: 'AI assistant',
  welcomeMessage: 'Welcome! Please share your **name** and **email** to get started.',
  privacyPolicyUrl: 'https://yoursite.com/privacy',
  usePolling: false,
  position: 'bottom-right',
});

// Widget controller API
controller.show();      // Open the chat panel
controller.hide();      // Close the chat panel
controller.toggle();    // Toggle visibility
controller.send('Hi');  // Programmatically send a message
controller.destroy();   // Remove widget from DOM and clean up listeners
```

---

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

  return null; // Widget mounts itself into document.body
}
```

Add to your root layout:

```jsx
// app/layout.jsx (Next.js App Router)
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

**Environment variables** (`.env.local`):

```env
NEXT_PUBLIC_DYNARIS_USER_ID=your_user_id_here
NEXT_PUBLIC_DYNARIS_API_URL=https://api.dynaris.ai
```

---

## Build Output

Running `pnpm build` produces two files in `dist/`:

| File | Format | Best For |
|------|--------|---------|
| `dist/dynaris-widget.es.js` | ESM | `import { init } from '@dynaris/widget'` — bundlers, Vite, Next.js |
| `dist/dynaris-widget.umd.cjs` | UMD | `<script>` tag embedding — styles are inlined, single self-contained file |

---

## Publishing & Distribution

### Publish to NPM

```bash
# Bump version in package.json first
pnpm build
npm publish --access public
```

### Use a local path (monorepos)

In a consuming repo's `package.json`:

```json
{
  "dependencies": {
    "@dynaris/widget": "file:../dynaris-widget"
  }
}
```

Then run `pnpm install` in the consuming repo.

### CDN / Static host

Copy `dist/dynaris-widget.umd.cjs` to your static host and reference it directly in the script `src`.

---

## API Contract

The widget communicates with the following gateway endpoints. All requests include a `session_id` (UUID persisted in `localStorage`).

### `POST /api/chat-widget/message`

Send a user message.

**Request body:**
```json
{
  "user_id": "string",
  "session_id": "string",
  "message": "string",
  "attachments": [
    {
      "name": "file.pdf",
      "type": "application/pdf",
      "data": "<base64>"
    }
  ]
}
```

**Response:** `200 OK` (body ignored by widget)

---

### `GET /api/chat-widget/messages`

Poll for new messages (used when `usePolling: true` or SSE is unavailable).

**Query params:** `user_id`, `session_id`, `after` (last seen message ID)

**Response:**
```json
{
  "messages": [
    {
      "id": "string",
      "direction": "inbound",
      "content": "Hello!",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### `GET /api/chat-widget/sse`

Server-Sent Events stream for real-time replies.

**Query params:** `user_id`, `session_id`

**Event format:**
```
event: chat_new_message
data: {"type":"chat_new_message","data":{"message":{"id":"...","content":"Hello!","direction":"inbound"}}}
```

---

### `POST /api/chat-widget/transcript`

Send chat transcript (optional — called on session end if implemented).

**Request body:**
```json
{
  "user_id": "string",
  "session_id": "string",
  "messages": [...]
}
```

---

## Troubleshooting

### Widget doesn't appear

- Check the browser console for errors.
- Ensure `data-user-id` (or `userId`) is set.
- Confirm the script `src` path is correct and the file loads (Network tab).

### Messages send but no replies arrive

- Verify the gateway is running and the chat widget routes are implemented.
- Check `data-api-url` points to the correct gateway URL.
- Try switching to polling mode: `data-use-polling="true"` — SSE connections may be blocked by some proxies.

### SSE connection fails / keeps reconnecting

- Some reverse proxies (nginx, Cloudflare) buffer SSE. Set `proxy_buffering off` in nginx or use polling mode.
- Check CORS headers on the gateway allow your widget's origin.

### Styles look broken

- If importing via NPM/ESM, make sure your bundler isn't tree-shaking the CSS import in `src/index.js`.
- The UMD build has styles inlined — no separate CSS file needed for script tag use.

### Session resets on every page load

- `localStorage` must be available. Some browsers block it in private/incognito mode or when third-party cookies are blocked.

### TypeScript errors

- The `dynaris-widget.d.ts` type definitions are in the package root. If your IDE doesn't pick them up, add `"types": ["@dynaris/widget"]` to your `tsconfig.json`.

---

## Contributing

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes in `src/`. Keep production dependencies at zero.

3. Test locally with `pnpm dev` against a running gateway.

4. Build and verify output:
   ```bash
   pnpm build
   ```

5. Open a pull request against `main` with a clear description of the change.

**Guidelines:**
- No external runtime dependencies — the widget must stay self-contained.
- Keep the UMD bundle as a single file (styles inlined via `vite.config.js`).
- Test both SSE and polling modes before submitting.
