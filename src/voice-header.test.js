/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it } from 'vitest';
import { createWidget } from './ui.js';

describe('header voice CTA', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders an in-widget voice button when voiceEnabled is true', () => {
    createWidget({
      userId: 'u1',
      voiceEnabled: true,
      voiceAgentId: 'agent-1',
      voiceCallLabel: 'Talk to our voice AI',
    });

    const control = document.querySelector('.dynaris-widget-header-voice');
    expect(control?.tagName).toBe('BUTTON');
    expect(control?.getAttribute('data-state')).toBe('idle');
    expect(control?.getAttribute('title')).toBeNull();
    expect(
      control?.querySelector('.dynaris-widget-header-voice-tooltip')?.textContent
    ).toBe('Talk to our voice AI');
    expect(document.querySelector('.dynaris-widget-header-voice-status')).toBeNull();
  });

  it('renders icon-only header link with tel href and hover title when voicePhoneNumber is set', () => {
    createWidget({
      userId: 'u1',
      voicePhoneNumber: '7867553623',
      voiceCallLabel: 'Call our voice AI',
    });

    const link = document.querySelector('.dynaris-widget-header-voice');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('tel:+17867553623');
    expect(link.querySelector('svg')).toBeTruthy();
    expect(link.querySelector('.dynaris-widget-header-voice-text')).toBeNull();
    expect(link.getAttribute('title')).toBe('Call our voice AI · (786) 755-3623');
    expect(link.getAttribute('target')).toBeNull();
    expect(link.getAttribute('aria-label')).toContain('(786) 755-3623');
    expect(document.querySelector('.dynaris-widget-voice-dialer')).toBeNull();
  });

  it('uses voiceCallUrl for href and target _blank when set (website flow)', () => {
    createWidget({
      userId: 'u1',
      voicePhoneNumber: '7867553623',
      voiceCallUrl: 'https://example.com/voice',
      voiceCallLabel: 'Talk on the web',
    });

    const link = document.querySelector('.dynaris-widget-header-voice');
    expect(link.getAttribute('href')).toBe('https://example.com/voice');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('aria-label')).toContain('Opens in a new tab');
    expect(link.getAttribute('title')).toBe('Talk on the web · Opens website');
  });

  it('shows header link with only voiceCallUrl and no phone', () => {
    createWidget({
      userId: 'u1',
      voiceCallUrl: 'https://example.com/contact',
    });

    const link = document.querySelector('.dynaris-widget-header-voice');
    expect(link?.getAttribute('href')).toBe('https://example.com/contact');
  });

  it('omits voice control when no phone and no url', () => {
    createWidget({ userId: 'u1' });
    expect(document.querySelector('.dynaris-widget-header-voice')).toBeNull();
  });
});
