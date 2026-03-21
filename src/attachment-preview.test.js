import { describe, expect, it } from 'vitest';
import { shouldShowImagePreview } from './attachment-preview.js';

describe('shouldShowImagePreview', () => {
  it('returns true for image mime with data_url', () => {
    expect(
      shouldShowImagePreview({
        mime_type: 'image/png',
        data_url: 'data:image/png;base64,abc',
      })
    ).toBe(true);
  });

  it('returns false without data_url', () => {
    expect(
      shouldShowImagePreview({
        mime_type: 'image/png',
        data_base64: 'x',
      })
    ).toBe(false);
  });

  it('returns false for non-image mime', () => {
    expect(
      shouldShowImagePreview({
        mime_type: 'application/pdf',
        data_url: 'data:application/pdf;base64,abc',
      })
    ).toBe(false);
  });

  it('returns true when data_url is image even if mime_type is empty', () => {
    expect(
      shouldShowImagePreview({
        mime_type: '',
        data_url: 'data:image/png;base64,abc',
      })
    ).toBe(true);
  });
});
