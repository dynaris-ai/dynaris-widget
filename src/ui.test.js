/** @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest';

import { appendMessage } from './ui.js';

describe('appendMessage', () => {
  it('renders markdown links as anchors', () => {
    const messagesEl = document.createElement('div');

    appendMessage(messagesEl, {
      content: {
        body: 'Open [Docs](https://docs.dynaris.ai) for more info.',
      },
    }, 'inbound');

    const link = messagesEl.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe('Docs');
    expect(link?.getAttribute('href')).toBe('https://docs.dynaris.ai');
    expect(messagesEl.textContent).toContain('for more info.');
  });
});
