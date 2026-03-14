# Dynaris Widget

Embeddable chat widget that connects to the Dynaris chat pipeline via the `web_widget` channel. Drop it into any website to add AI-powered chat backed by the same pipeline used for WhatsApp.

## Requirements

- **Gateway:** The gateway-server must implement the chat widget API (see `gateway-server/docs/CHAT_WIDGET_IMPLEMENTATION.md`):
  - `POST /api/chat-widget/message` - inbound messages
  - `GET /api/chat-widget/messages` - poll for replies (optional if SSE is used)
  - `GET /api/chat-widget/sse` - SSE stream for real-time replies (optional, fallback to polling)

## Installation

```bash
pnpm install
pnpm build
```

## Embedding

### Script Tag

Add one script tag to your HTML. Replace `YOUR_USER_ID` with the Dynaris user ID (site owner) and `https://api.dynaris.ai` with your gateway URL if different.

```html
<script
  src="https://unpkg.com/@dynaris/widget/dist/dynaris-widget.umd.cjs"
  data-dynaris-widget="true"
  data-user-id="YOUR_USER_ID"
  data-api-url="https://api.dynaris.ai"
  data-title="Chat"
  data-use-polling="true"
  data-position="bottom-right"
></script>
```

**Data attributes:**

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-user-id` | Yes | - | Dynaris user ID (site owner) |
| `data-api-url` | No | `https://api.dynaris.ai` | Gateway API base URL |
| `data-title` | No | `Text Support` | Agent name in header |
| `data-subtitle` | No | `AI assistant` | Subtitle under agent name |
| `data-welcome-message` | No | - | Initial message from AI (supports **bold**) |
| `data-privacy-policy-url` | No | - | URL for Privacy Policy link |
| `data-use-polling` | No | `false` | Use polling instead of SSE |
| `data-position` | No | `bottom-right` | `bottom-right` or `bottom-left` |

### NPM / ES Module

```js
import { init } from '@dynaris/widget';

init({
  userId: 'YOUR_USER_ID',
  apiUrl: 'https://api.dynaris.ai',
  title: 'Text Support',
  subtitle: 'AI assistant',
  welcomeMessage: 'Good morning and welcome. Please provide your **name** and **email** so I can assist you better.',
  privacyPolicyUrl: 'https://yoursite.com/privacy',
  usePolling: false,
  position: 'bottom-right',
});
```

### React / Next.js

```jsx
import { useEffect } from 'react';
import { init } from '@dynaris/widget';

export function ChatWidget() {
  useEffect(() => {
    const ctrl = init({
      userId: process.env.NEXT_PUBLIC_DYNARIS_USER_ID,
      apiUrl: process.env.NEXT_PUBLIC_DYNARIS_API_URL,
    });
    return () => ctrl?.destroy();
  }, []);
  return null;
}
```

## Replicating Across Repos

1. **Publish the package** (or use a private registry):
   ```bash
   npm publish --access public
   ```

2. **Or use a local path** in consuming repos:
   ```json
   {
     "dependencies": {
       "@dynaris/widget": "file:../dynaris-widget"
     }
   }
   ```

3. **Or copy the built output** into your CDN/static host and embed via script tag:
   - `dist/dynaris-widget.umd.cjs`
   - `dist/dynaris-widget.css` (if emitted separately)

4. **Self-host the script:** Host the built files in your own domain and point `src` to them for full control.

## Local Development

```bash
pnpm dev
```

Then open `http://localhost:5173`. The demo uses `userId: 'demo-user-id'` and `apiUrl: 'http://localhost:3001'`. Run gateway-server locally with the chat widget routes implemented to test end-to-end.

## Build Output

| File | Format | Use |
|------|--------|-----|
| `dist/dynaris-widget.es.js` | ESM | `import { init } from '@dynaris/widget'` |
| `dist/dynaris-widget.umd.cjs` | UMD | Script tag (styles inlined, single file) |

## API Contract

The widget expects these gateway endpoints:

- **POST** `/api/chat-widget/message`  
  Body: `{ user_id, session_id, message }`

- **GET** `/api/chat-widget/messages?user_id=&session_id=&after=`  
  Returns: `{ messages: [...] }` where each message has `id`, `direction`, `content`, `createdAt`

- **GET** `/api/chat-widget/sse?user_id=&session_id=`  
  SSE events: `{ type: 'chat_new_message', data: { message } }`
