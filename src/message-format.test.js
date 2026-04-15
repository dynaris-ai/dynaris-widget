import { describe, expect, it } from 'vitest';
import { splitTrailingUrlPunctuation, tokenizeInlineText } from './message-format.js';

describe('splitTrailingUrlPunctuation', () => {
  it('keeps balanced parentheses inside urls', () => {
    expect(splitTrailingUrlPunctuation('https://example.com/docs(test)')).toEqual({
      url: 'https://example.com/docs(test)',
      trailing: '',
    });
  });

  it('moves trailing punctuation outside urls', () => {
    expect(splitTrailingUrlPunctuation('https://example.com/docs).')).toEqual({
      url: 'https://example.com/docs',
      trailing: ').',
    });
  });
});

describe('tokenizeInlineText', () => {
  it('tokenizes links, bold text, and line breaks', () => {
    expect(tokenizeInlineText('See **https://dynaris.ai**\nDocs: https://docs.dynaris.ai.')).toEqual([
      { type: 'text', value: 'See ', bold: false },
      { type: 'link', value: 'https://dynaris.ai', href: 'https://dynaris.ai', bold: true },
      { type: 'lineBreak' },
      { type: 'text', value: 'Docs: ', bold: false },
      { type: 'link', value: 'https://docs.dynaris.ai', href: 'https://docs.dynaris.ai', bold: false },
      { type: 'text', value: '.', bold: false },
    ]);
  });

  it('tokenizes markdown links with labels', () => {
    expect(
      tokenizeInlineText(
        'Read [Docs](https://docs.dynaris.ai) and **[Pricing](https://dynaris.ai/pricing)**'
      )
    ).toEqual([
      { type: 'text', value: 'Read ', bold: false },
      { type: 'link', value: 'Docs', href: 'https://docs.dynaris.ai', bold: false },
      { type: 'text', value: ' and ', bold: false },
      {
        type: 'link',
        value: 'Pricing',
        href: 'https://dynaris.ai/pricing',
        bold: true,
      },
    ]);
  });

  it('leaves plain text untouched when there are no links', () => {
    expect(tokenizeInlineText('Hello **team**')).toEqual([
      { type: 'text', value: 'Hello ', bold: false },
      { type: 'text', value: 'team', bold: true },
    ]);
  });
});
