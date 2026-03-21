/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it } from 'vitest';
import { createWidget } from './ui.js';

describe('privacy notice layout', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('keeps privacy slot out of the scrollable messages column so it does not cover chat', () => {
    createWidget({
      userId: 'test-user',
      privacyPolicyUrl: 'https://example.com/privacy',
    });

    const area = document.querySelector('.dynaris-widget-panel-messages-area');
    const scroll = document.querySelector('.dynaris-widget-panel-messages');
    const slot = document.querySelector('.dynaris-widget-privacy-slot');

    expect(area).toBeTruthy();
    expect(scroll).toBeTruthy();
    expect(slot).toBeTruthy();

    expect(scroll.parentElement).toBe(area);
    expect(slot.parentElement).toBe(area);
    expect(Array.from(area.children)).toEqual([scroll, slot]);
    expect(scroll.contains(slot)).toBe(false);
  });

  it('inlines bundled Dynaris SVG for powered-by when poweredByLogoUrl is omitted', () => {
    createWidget({
      userId: 'test-user',
    });

    const mark = document.querySelector('.dynaris-widget-footer .dynaris-widget-footer-logo');
    expect(mark?.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(mark?.localName).toBe('svg');
    expect(mark?.querySelector('path')?.getAttribute('d')).toMatch(/^M65 0/);
  });
});
