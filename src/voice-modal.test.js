/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createVoiceOverlay } from './voice-modal.js';

describe('createVoiceOverlay', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('marks overlay busy while connecting and animates state attribute', () => {
    const panel = document.createElement('div');
    document.body.appendChild(panel);
    const overlay = createVoiceOverlay(panel, {
      onEndCall: vi.fn(),
      onToggleMic: vi.fn(),
    });

    overlay.open();
    overlay.setState('connecting', 'Connecting to voice AI…');

    const el = panel.querySelector('.dynaris-widget-voice-overlay');
    expect(el.getAttribute('data-voice-state')).toBe('connecting');
    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(panel.querySelectorAll('.dynaris-widget-voice-wave-bar').length).toBe(9);

    overlay.setState('live', 'Voice AI is live.');
    expect(el.getAttribute('aria-busy')).toBe('false');
    expect(el.getAttribute('data-voice-state')).toBe('live');

    overlay.close();
    expect(el.getAttribute('aria-busy')).toBe('false');
  });

  it('keeps transcript on end and clears on the next new call', () => {
    const panel = document.createElement('div');
    document.body.appendChild(panel);
    const overlay = createVoiceOverlay(panel, {
      onEndCall: vi.fn(),
      onToggleMic: vi.fn(),
    });

    overlay.open();
    overlay.setState('live', 'Live');
    overlay.addTranscript('ai', 'Hello');
    overlay.setState('ended', 'Call ended');

    const inner = panel.querySelector('.dynaris-widget-voice-transcript-inner');
    expect(inner.textContent).toContain('Hello');
    expect(panel.querySelector('.dynaris-widget-voice-controls-post').hidden).toBe(false);

    overlay.dismiss();
    expect(panel.querySelector('.dynaris-widget-voice-overlay').style.display).toBe('none');

    overlay.open();
    expect(panel.querySelector('.dynaris-widget-voice-transcript-inner').textContent).toBe('');
  });
});
