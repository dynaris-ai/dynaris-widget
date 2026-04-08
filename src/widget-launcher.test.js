/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  sendMessageMock,
  fetchMessagesMock,
  submitWidgetContactMock,
  createEventSourceMock,
  voiceStartMock,
  voiceStopMock,
  voiceIsActiveMock,
  voiceDestroyMock,
  voiceToggleMicMock,
} = vi.hoisted(() => ({
  sendMessageMock: vi.fn(),
  fetchMessagesMock: vi.fn(),
  submitWidgetContactMock: vi.fn(),
  createEventSourceMock: vi.fn(),
  voiceStartMock: vi.fn(),
  voiceStopMock: vi.fn(),
  voiceIsActiveMock: vi.fn(),
  voiceDestroyMock: vi.fn(),
  voiceToggleMicMock: vi.fn(),
}));

vi.mock('./api.js', () => ({
  sendMessage: sendMessageMock,
  fetchMessages: fetchMessagesMock,
  createEventSource: createEventSourceMock,
  submitWidgetContact: submitWidgetContactMock,
}));

vi.mock('./session.js', () => ({
  getOrCreateSessionId: () => 'session-1',
  getOrCreateScreeningFingerprint: () => 'fp-1',
}));

vi.mock('./speech.js', () => ({
  supportsSpeechRecognition: () => false,
  getSpeechRecognitionCtor: () => null,
}));

vi.mock('./voice-modal.js', () => ({
  createVoiceOverlay: () => ({
    open: vi.fn(),
    setState: vi.fn(),
    addTranscript: vi.fn(),
    destroy: vi.fn(),
  }),
}));

vi.mock('./voice-session.js', () => ({
  createVoiceSessionManager: () => ({
    start: voiceStartMock,
    stop: voiceStopMock,
    isActive: voiceIsActiveMock,
    destroy: voiceDestroyMock,
    toggleMic: voiceToggleMicMock,
  }),
}));

import { init } from './widget.js';

function flushPromises() {
  return Promise.resolve()
    .then(() => Promise.resolve())
    .then(() => new Promise((resolve) => setTimeout(resolve, 0)));
}

function defaultContactValues() {
  return {
    firstName: 'Pat',
    lastName: 'Lee',
    phoneNumber: '3055551212',
    email: 'pat@example.com',
    description: 'Need pricing help',
  };
}

async function submitPreChatForm() {
  const form = document.querySelector('.dynaris-widget-prechat-form');
  form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await flushPromises();
  await flushPromises();
}

describe('widget launcher routing', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    window.localStorage.clear();
    sendMessageMock.mockReset().mockResolvedValue({});
    fetchMessagesMock.mockReset().mockResolvedValue({ messages: [] });
    submitWidgetContactMock.mockReset().mockResolvedValue({});
    createEventSourceMock.mockReset().mockReturnValue({ close: vi.fn() });
    voiceStartMock.mockReset().mockResolvedValue({});
    voiceStopMock.mockReset().mockResolvedValue({});
    voiceIsActiveMock.mockReset().mockReturnValue(false);
    voiceDestroyMock.mockReset().mockResolvedValue(undefined);
    voiceToggleMicMock.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('gates the chat launcher through pre-chat and restores hints on close', async () => {
    const ctrl = init({
      apiKey: 'api-key',
      usePolling: false,
      title: 'Chat with us',
      voiceEnabled: true,
      voiceAgentId: 'agent-1',
      preChatForm: {
        enabled: true,
        defaultValues: defaultContactValues(),
      },
    });

    const [chatBtn, voiceBtn] = document.querySelectorAll(
      '.dynaris-widget-launcher-hint-bubble'
    );
    const launcherWrap = document.querySelector('.dynaris-widget-launcher-wrap');
    const panel = document.querySelector('.dynaris-widget-panel');
    expect(chatBtn?.hidden).toBe(false);
    expect(voiceBtn?.hidden).toBe(false);
    expect(panel?.style.bottom).toBe('172px');

    chatBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(launcherWrap?.classList.contains('dynaris-widget-launcher-wrap--hints-hidden')).toBe(
      true
    );
    expect(panel?.style.bottom).toBe('84px');
    expect(submitWidgetContactMock).not.toHaveBeenCalled();
    expect(sendMessageMock).not.toHaveBeenCalled();
    expect(document.querySelector('#dynaris-prechat-firstName')?.value).toBe('Pat');
    expect(document.querySelector('#dynaris-prechat-lastName')?.value).toBe('Lee');
    expect(document.querySelector('#dynaris-prechat-phoneNumber')?.value).toBe(
      '3055551212'
    );
    expect(document.querySelector('#dynaris-prechat-email')?.value).toBe(
      'pat@example.com'
    );
    expect(document.querySelector('#dynaris-prechat-description')?.value).toBe(
      'Need pricing help'
    );

    await submitPreChatForm();

    expect(submitWidgetContactMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(submitWidgetContactMock.mock.invocationCallOrder[0]).toBeLessThan(
      sendMessageMock.mock.invocationCallOrder[0]
    );
    expect(sendMessageMock.mock.calls[0][3]).toContain("I'd like to chat");

    ctrl?.hide();
    await flushPromises();

    expect(launcherWrap?.classList.contains('dynaris-widget-launcher-wrap--hints-hidden')).toBe(
      false
    );
    expect(panel?.style.bottom).toBe('172px');
  });

  it('gates the voice launcher through pre-chat before starting browser voice', async () => {
    init({
      apiKey: 'api-key',
      usePolling: false,
      title: 'Chat with us',
      welcomeMessage: 'Welcome opener',
      voiceEnabled: true,
      voiceAgentId: 'agent-1',
      preChatForm: {
        enabled: true,
        defaultValues: defaultContactValues(),
      },
    });

    const [, voiceBtn] = document.querySelectorAll(
      '.dynaris-widget-launcher-hint-bubble'
    );
    voiceBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(submitWidgetContactMock).not.toHaveBeenCalled();
    expect(voiceStartMock).not.toHaveBeenCalled();
    expect(sendMessageMock).not.toHaveBeenCalled();

    await submitPreChatForm();

    await vi.waitFor(() => {
      expect(submitWidgetContactMock).toHaveBeenCalledTimes(1);
      expect(voiceStartMock).toHaveBeenCalledTimes(1);
    });
    expect(submitWidgetContactMock.mock.invocationCallOrder[0]).toBeLessThan(
      voiceStartMock.mock.invocationCallOrder[0]
    );
    expect(createEventSourceMock).not.toHaveBeenCalled();
    expect(fetchMessagesMock).not.toHaveBeenCalled();
    expect(sendMessageMock).not.toHaveBeenCalled();
    expect(document.querySelector('.dynaris-widget-msg')).toBeNull();
  });

  it('gates the voice launcher through pre-chat before following the fallback voice link', async () => {
    init({
      apiKey: 'api-key',
      usePolling: false,
      title: 'Chat with us',
      voicePhoneNumber: '7867553623',
      preChatForm: {
        enabled: true,
        defaultValues: defaultContactValues(),
      },
    });

    const headerVoiceLink = document.querySelector('.dynaris-widget-header-voice');
    const headerVoiceClick = vi.fn((event) => event.preventDefault());
    headerVoiceLink?.addEventListener('click', headerVoiceClick);

    const [, voiceBtn] = document.querySelectorAll(
      '.dynaris-widget-launcher-hint-bubble'
    );
    voiceBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(headerVoiceClick).not.toHaveBeenCalled();

    await submitPreChatForm();

    await vi.waitFor(() => {
      expect(submitWidgetContactMock).toHaveBeenCalledTimes(1);
      expect(headerVoiceClick).toHaveBeenCalledTimes(1);
    });
    expect(submitWidgetContactMock.mock.invocationCallOrder[0]).toBeLessThan(
      headerVoiceClick.mock.invocationCallOrder[0]
    );
  });
});
