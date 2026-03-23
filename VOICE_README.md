# In-Widget Voice Notes

## Current State

The `dynaris-widget` repo now supports an in-widget LiveKit voice control in the header.

Today, local playground behavior is split into two modes:

- `preview configured`: icon is visually active/animated so the UI is obvious during local testing
- `fully configured`: icon can start a real browser voice session through `gateway-server` -> `composio-server` -> LiveKit

## Local Playground

Use `playground/.env.local`.

Minimum preview config:

```env
VITE_CHAT_WIDGET_API_KEY=your_mock_or_real_widget_api_key
```

Full browser voice config:

```env
VITE_CHAT_WIDGET_API_KEY=your_widget_api_key
VITE_CHAT_WIDGET_VOICE_AGENT_ID=your_voice_agent_uuid
VITE_CHAT_WIDGET_VOICE_API_URL=https://api.dynaris.ai
```

Optional:

```env
VITE_CHAT_WIDGET_VOICE_PARTICIPANT_NAME=Website Visitor
VITE_CHAT_WIDGET_VOICE_AGENT_NAME=PRODUCTION-AGENT
```

## What Still Needs To Be Implemented

1. `dynaris-web` should become the source of truth for widget voice configuration.
2. The selected voice agent in `dynaris-web` should be exposed with widget/embed configuration.
3. Consumer apps should stop relying on manual env wiring for `voiceAgentId` once `dynaris-web` provides it.
4. The published `@dynaris/widget` package needs a new release containing the LiveKit voice UI/client changes.
5. Consumer lockfiles need to be updated to that published widget version.
6. A real end-to-end browser validation should be run against live or staging `gateway-server`, `composio-server`, LiveKit, and the ECS-hosted `voice-agent-livekit` worker.
7. Longer term, `gateway-server` can resolve widget voice agent selection server-side so sites do not need to pass `voiceAgentId` directly.

## Production Direction

Preferred long-term flow:

1. User configures/selects a voice agent in `dynaris-web`.
2. `dynaris-web` stores that selection with the widget/site configuration.
3. Widget config returned by Dynaris includes voice settings.
4. The widget renders the voice control automatically.

This keeps the widget embed simple and makes `dynaris-web` the canonical configuration layer.
