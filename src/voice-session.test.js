/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const roomInstances = [];

vi.mock('livekit-client', () => {
  class MockRoom {
    constructor() {
      this.handlers = new Map();
      this.localParticipant = {
        identity: 'local-user',
        setMicrophoneEnabled: vi.fn().mockResolvedValue(undefined),
      };
      roomInstances.push(this);
    }

    on(event, handler) {
      this.handlers.set(event, handler);
    }

    async connect(url, token) {
      this.connectArgs = { url, token };
    }

    async disconnect() {
      this.handlers.get('disconnected')?.();
    }
  }

  return {
    Room: MockRoom,
    RoomEvent: {
      TrackSubscribed: 'trackSubscribed',
      TrackUnsubscribed: 'trackUnsubscribed',
      TranscriptionReceived: 'transcriptionReceived',
      Disconnected: 'disconnected',
    },
    Track: {
      Kind: {
        Audio: 'audio',
      },
    },
  };
});

const startVoiceSession = vi.fn();
const closeVoiceSession = vi.fn();

vi.mock('./voice-api.js', () => ({
  startVoiceSession,
  closeVoiceSession,
  isVoiceDebugEnabled: () => false,
  resolveVoiceApiBaseUrl: (apiUrl, voiceApiUrl) => {
    const raw = typeof voiceApiUrl === 'string' && voiceApiUrl.trim() ? voiceApiUrl : apiUrl;
    return String(raw || '').replace(/\/+$/, '');
  },
  voiceDprint: vi.fn(),
}));

describe('voice session manager', () => {
  beforeEach(() => {
    roomInstances.length = 0;
    startVoiceSession.mockReset();
    closeVoiceSession.mockReset();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('starts a LiveKit session and enables the microphone', async () => {
    const states = [];
    const transcripts = [];
    startVoiceSession.mockResolvedValue({
      session_id: 'widget-session-1',
      room_name: 'web_voice_session_widget',
      token: 'jwt-token',
      ws_url: 'wss://livekit.example.com',
      expires_at: '2030-01-01T00:00:00Z',
    });

    const { createVoiceSessionManager } = await import('./voice-session.js');
    const manager = createVoiceSessionManager({
      apiKey: 'api-key',
      apiUrl: 'https://api.example.com',
      sessionId: 'widget-session-1',
      voiceAgentId: 'agent-1',
      onStateChange: (state) => states.push(state),
      onTranscript: (entry) => transcripts.push(entry),
    });

    await manager.start();

    const room = roomInstances[0];
    expect(startVoiceSession).toHaveBeenCalledWith(
      'https://api.example.com',
      'api-key',
      expect.objectContaining({
        sessionId: 'widget-session-1',
        agentId: 'agent-1',
      }),
    );
    expect(room.connectArgs).toEqual({
      url: 'wss://livekit.example.com',
      token: 'jwt-token',
    });
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenCalledWith(true);
    expect(states.map((entry) => entry.state)).toEqual(['connecting', 'live']);

    room.handlers.get('transcriptionReceived')?.(
      [{ text: 'Hello there', final: true }],
      { identity: 'agent-1' },
    );
    expect(transcripts).toEqual([
      {
        speaker: 'ai',
        text: 'Hello there',
        participantIdentity: 'agent-1',
      },
    ]);
  });

  it('cleans up remote audio and closes the session', async () => {
    startVoiceSession.mockResolvedValue({
      session_id: 'widget-session-1',
      room_name: 'web_voice_session_widget',
      token: 'jwt-token',
      ws_url: 'wss://livekit.example.com',
      expires_at: '2030-01-01T00:00:00Z',
    });
    closeVoiceSession.mockResolvedValue({ ok: true });

    const { createVoiceSessionManager } = await import('./voice-session.js');
    const manager = createVoiceSessionManager({
      apiKey: 'api-key',
      apiUrl: 'https://api.example.com',
      sessionId: 'widget-session-1',
      voiceAgentId: 'agent-1',
    });

    await manager.start();

    const room = roomInstances[0];
    const audioEl = document.createElement('audio');
    audioEl.play = vi.fn().mockResolvedValue(undefined);
    audioEl.pause = vi.fn();
    room.handlers.get('trackSubscribed')?.(
      {
        kind: 'audio',
        attach: () => audioEl,
        detach: () => [audioEl],
      },
      {},
      { identity: 'agent-1' },
    );

    expect(document.body.contains(audioEl)).toBe(true);
    await manager.stop();
    expect(closeVoiceSession).toHaveBeenCalledWith(
      'https://api.example.com',
      'api-key',
      expect.objectContaining({ sessionId: 'widget-session-1' }),
    );
    expect(document.body.contains(audioEl)).toBe(false);
    expect(manager.getState()).toBe('idle');
  });
});
