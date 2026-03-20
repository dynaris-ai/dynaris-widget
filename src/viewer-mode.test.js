import { describe, expect, it } from 'vitest';
import { normalizeViewerMode, VIEWER_EMBED, VIEWER_MOBILE_APP } from './viewer-mode.js';

describe('normalizeViewerMode', () => {
  it('returns mobile-app for mobile-app and mobile_app', () => {
    expect(normalizeViewerMode('mobile-app')).toBe(VIEWER_MOBILE_APP);
    expect(normalizeViewerMode('mobile_app')).toBe(VIEWER_MOBILE_APP);
  });

  it('returns embed for default, unknown, and null', () => {
    expect(normalizeViewerMode(undefined)).toBe(VIEWER_EMBED);
    expect(normalizeViewerMode(null)).toBe(VIEWER_EMBED);
    expect(normalizeViewerMode('')).toBe(VIEWER_EMBED);
    expect(normalizeViewerMode('embed')).toBe(VIEWER_EMBED);
    expect(normalizeViewerMode('floating')).toBe(VIEWER_EMBED);
  });
});
