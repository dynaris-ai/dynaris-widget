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
