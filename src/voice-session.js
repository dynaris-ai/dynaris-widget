import { Room, RoomEvent, Track } from 'livekit-client';

import { closeVoiceSession, startVoiceSession } from './voice-api.js';

export const VOICE_STATE_IDLE = 'idle';
export const VOICE_STATE_CONNECTING = 'connecting';
export const VOICE_STATE_LIVE = 'live';
export const VOICE_STATE_DISCONNECTING = 'disconnecting';
export const VOICE_STATE_ERROR = 'error';

function removeAudioElements(audioElements) {
  for (const audioEl of audioElements.splice(0)) {
    try {
      audioEl.pause();
    } catch (_) {}
    audioEl.remove();
  }
}

function setVoiceState(state, message, onStateChange) {
  onStateChange?.({ state, message });
}

export function createVoiceSessionManager({
  apiKey,
  apiUrl,
  sessionId,
  voiceAgentId,
  voiceParticipantName,
  voiceSessionDurationMinutes = 60,
  voiceAgentName,
  voiceApiUrl,
  onStateChange,
  onTranscript,
  onError,
}) {
  let room = null;
  let voiceSession = null;
  let currentState = VOICE_STATE_IDLE;
  let isManualDisconnect = false;
  const audioElements = [];

  function emitState(state, message) {
    currentState = state;
    setVoiceState(state, message, onStateChange);
  }

  function handleError(error, fallbackMessage) {
    const message = error?.message || fallbackMessage;
    emitState(VOICE_STATE_ERROR, message);
    onError?.(error);
  }

  function bindRoomEvents(newRoom) {
    newRoom.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      if (track.kind !== Track.Kind.Audio) return;
      if (participant?.identity === newRoom.localParticipant.identity) return;

      const audioEl = track.attach();
      audioEl.autoplay = true;
      audioEl.volume = 1;
      audioEl.setAttribute('data-dynaris-widget-voice', '1');
      audioElements.push(audioEl);
      document.body.appendChild(audioEl);
      void audioEl.play().catch(() => {});
    });

    newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      const detached = track.detach();
      detached.forEach((node) => {
        const idx = audioElements.indexOf(node);
        if (idx >= 0) audioElements.splice(idx, 1);
        node.remove();
      });
    });

    newRoom.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
      const speaker =
        participant?.identity === newRoom.localParticipant.identity ? 'user' : 'ai';
      for (const segment of segments) {
        const text = String(segment?.text || '').trim();
        if (!segment?.final || !text) continue;
        onTranscript?.({
          speaker,
          text,
          participantIdentity: participant?.identity || null,
        });
      }
    });

    newRoom.on(RoomEvent.Disconnected, () => {
      removeAudioElements(audioElements);
      room = null;
      if (isManualDisconnect) {
        return;
      }
      emitState(VOICE_STATE_ERROR, 'Voice session disconnected.');
    });
  }

  async function start() {
    if (currentState === VOICE_STATE_CONNECTING || currentState === VOICE_STATE_LIVE) {
      return voiceSession;
    }
    if (!voiceAgentId) {
      const error = new Error('voiceAgentId is required for browser voice.');
      handleError(error, error.message);
      throw error;
    }

    emitState(VOICE_STATE_CONNECTING, 'Connecting to voice AI...');
    try {
      voiceSession = await startVoiceSession(apiUrl, apiKey, {
        sessionId,
        agentId: voiceAgentId,
        participantName: voiceParticipantName,
        sessionDurationMinutes: voiceSessionDurationMinutes,
        agentName: voiceAgentName,
        voiceApiUrl,
      });

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      bindRoomEvents(newRoom);
      await newRoom.connect(voiceSession.ws_url, voiceSession.token);
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      room = newRoom;
      emitState(VOICE_STATE_LIVE, 'Voice AI is live.');
      return voiceSession;
    } catch (error) {
      removeAudioElements(audioElements);
      room = null;
      voiceSession = null;
      handleError(error, 'Unable to start voice session.');
      throw error;
    }
  }

  async function stop() {
    if (
      currentState === VOICE_STATE_DISCONNECTING ||
      (currentState === VOICE_STATE_IDLE && !voiceSession && !room)
    ) {
      return;
    }

    emitState(VOICE_STATE_DISCONNECTING, 'Ending voice session...');
    isManualDisconnect = true;
    const activeRoom = room;
    const activeSessionId = voiceSession?.session_id || sessionId;

    try {
      if (activeRoom) {
        await activeRoom.disconnect();
      } else {
        removeAudioElements(audioElements);
      }
    } finally {
      room = null;
    }

    try {
      await closeVoiceSession(apiUrl, apiKey, {
        sessionId: activeSessionId,
        voiceApiUrl,
      });
    } catch (error) {
      onError?.(error);
    } finally {
      voiceSession = null;
      emitState(VOICE_STATE_IDLE, 'Voice session ended.');
      isManualDisconnect = false;
    }
  }

  async function destroy() {
    await stop();
    removeAudioElements(audioElements);
  }

  return {
    start,
    stop,
    destroy,
    getState() {
      return currentState;
    },
    isActive() {
      return currentState === VOICE_STATE_CONNECTING || currentState === VOICE_STATE_LIVE;
    },
  };
}
