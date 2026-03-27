/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('voice-api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('throws VoiceApiError with status and url on 404 JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => JSON.stringify({ detail: 'Not Found' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { startVoiceSession, VoiceApiError } = await import('./voice-api.js');

    await expect(
      startVoiceSession('https://api.example.com', 'k', {
        sessionId: 's1',
        agentId: 'a1',
        voiceApiUrl: undefined,
      }),
    ).rejects.toMatchObject({
      name: 'VoiceApiError',
      status: 404,
      message: 'Not Found',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/chat-widget/voice/start',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(VoiceApiError).toBeDefined();
  });

  it('includes metadata in voice start payload when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ session_id: 's1', token: 't', ws_url: 'wss://x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { startVoiceSession } = await import('./voice-api.js');

    await startVoiceSession('https://api.example.com', 'k', {
      sessionId: 's1',
      agentId: 'a1',
      metadata: {
        session_fingerprint: 'fp-1',
        channel: 'dynaris_widget_voice',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/chat-widget/voice/start',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          session_id: 's1',
          agent_id: 'a1',
          participant_name: undefined,
          session_duration_minutes: undefined,
          agent_name: undefined,
          metadata: {
            session_fingerprint: 'fp-1',
            channel: 'dynaris_widget_voice',
          },
        }),
      }),
    );
  });

  it('includes metadata in chat send payload when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { sendMessage } = await import('./api.js');

    await sendMessage(
      'https://api.example.com',
      undefined,
      's1',
      'hello',
      'k',
      [],
      {
        session_fingerprint: 'fp-1',
        channel: 'dynaris_widget',
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/chat-widget/message',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          session_id: 's1',
          message: 'hello',
          metadata: {
            session_fingerprint: 'fp-1',
            channel: 'dynaris_widget',
          },
        }),
      }),
    );
  });

  it('parses non-JSON error bodies without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: async () => '<html>error</html>',
      }),
    );

    const { startVoiceSession } = await import('./voice-api.js');

    await expect(
      startVoiceSession('https://api.example.com', 'k', {
        sessionId: 's1',
        agentId: 'a1',
      }),
    ).rejects.toMatchObject({
      status: 502,
    });
  });
});
