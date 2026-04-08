/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appendTypingIndicator, removeTypingIndicator } from './ui.js';

describe('typing progress hint', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders link above typing dots when progressHintUrl is set', () => {
    const messagesEl = document.createElement('div');
    document.body.appendChild(messagesEl);

    appendTypingIndicator(messagesEl, {
      text: 'View pricing',
      url: 'https://example.com/pricing',
    });

    const link = messagesEl.querySelector('.dynaris-widget-progress-hint');
    expect(link?.tagName).toBe('A');
    expect(link?.getAttribute('href')).toBe('https://example.com/pricing');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.textContent).toBe('View pricing');

    const stack = messagesEl.querySelector('.dynaris-widget-typing-stack');
    const typing = stack?.querySelector('.dynaris-widget-typing-indicator');
    expect(typing).toBeTruthy();
    expect(Array.from(stack.children).indexOf(link)).toBeLessThan(
      Array.from(stack.children).indexOf(typing),
    );
  });

  it('renders button and dispatches event when clicked without url', () => {
    const messagesEl = document.createElement('div');
    document.body.appendChild(messagesEl);
    const handler = vi.fn();
    window.addEventListener('dynaris-widget:progress-hint-click', handler);

    const onProgressHintClick = vi.fn();
    appendTypingIndicator(messagesEl, {
      text: 'Need help?',
      onClick: onProgressHintClick,
    });

    const btn = messagesEl.querySelector('.dynaris-widget-progress-hint');
    expect(btn?.tagName).toBe('BUTTON');
    btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onProgressHintClick).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.text).toBe('Need help?');

    window.removeEventListener('dynaris-widget:progress-hint-click', handler);
  });

  it('omits hint when text is empty', () => {
    const messagesEl = document.createElement('div');
    document.body.appendChild(messagesEl);

    appendTypingIndicator(messagesEl, { text: '   ', url: 'https://x.test' });
    expect(messagesEl.querySelector('.dynaris-widget-progress-hint')).toBeNull();

    appendTypingIndicator(messagesEl, null);
    expect(messagesEl.querySelectorAll('[data-typing="1"]').length).toBe(2);
    expect(messagesEl.querySelectorAll('.dynaris-widget-progress-hint').length).toBe(0);
  });

  it('removeTypingIndicator clears the row including hint', () => {
    const messagesEl = document.createElement('div');
    document.body.appendChild(messagesEl);

    appendTypingIndicator(messagesEl, { text: 'Tip', url: 'https://a.test' });
    removeTypingIndicator(messagesEl);

    expect(messagesEl.querySelector('[data-typing="1"]')).toBeNull();
    expect(messagesEl.innerHTML).toBe('');
  });
});
