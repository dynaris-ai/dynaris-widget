const URL_PATTERN = /https?:\/\/[^\s<]+/g;

function countChar(value, char) {
  let total = 0;
  for (const current of value) {
    if (current === char) total += 1;
  }
  return total;
}

export function splitTrailingUrlPunctuation(value) {
  let url = String(value || '');
  let trailing = '';

  while (url) {
    const lastChar = url[url.length - 1];
    const isPunctuation = '.,!?;:)'.includes(lastChar);
    if (!isPunctuation) break;
    if (lastChar === ')' && countChar(url, '(') >= countChar(url, ')')) {
      break;
    }
    trailing = lastChar + trailing;
    url = url.slice(0, -1);
  }

  return { url, trailing };
}

function pushTextToken(tokens, value, bold = false) {
  if (!value) return;
  tokens.push({ type: 'text', value, bold });
}

function matchMarkdownLink(text, startIndex) {
  if (text[startIndex] !== '[') return null;

  const labelEnd = text.indexOf('](', startIndex);
  if (labelEnd === -1) return null;

  const label = text.slice(startIndex + 1, labelEnd);
  if (!label) return null;

  const hrefStart = labelEnd + 2;
  let depth = 0;
  for (let index = hrefStart; index < text.length; index += 1) {
    const char = text[index];
    if (char === '(') {
      depth += 1;
      continue;
    }
    if (char !== ')') continue;
    if (depth > 0) {
      depth -= 1;
      continue;
    }

    const href = text.slice(hrefStart, index).trim();
    if (!/^https?:\/\//.test(href)) return null;
    return {
      start: startIndex,
      end: index + 1,
      value: label,
      href,
    };
  }
  return null;
}

function findNextMarkdownLink(text, fromIndex) {
  let index = text.indexOf('[', fromIndex);
  while (index !== -1) {
    const link = matchMarkdownLink(text, index);
    if (link) return link;
    index = text.indexOf('[', index + 1);
  }
  return null;
}

function findNextRawUrl(text, fromIndex) {
  URL_PATTERN.lastIndex = fromIndex;
  const match = URL_PATTERN.exec(text);
  URL_PATTERN.lastIndex = 0;
  if (!match) return null;
  const rawUrl = match[0];
  const { url, trailing } = splitTrailingUrlPunctuation(rawUrl);
  return {
    start: match.index,
    end: match.index + rawUrl.length,
    value: url,
    href: url,
    trailing,
  };
}

function pushLinkTokens(tokens, value, bold = false) {
  const text = String(value || '');
  let cursor = 0;

  while (cursor < text.length) {
    const nextMarkdown = findNextMarkdownLink(text, cursor);
    const nextRawUrl = findNextRawUrl(text, cursor);
    const nextToken =
      nextMarkdown && (!nextRawUrl || nextMarkdown.start <= nextRawUrl.start)
        ? { kind: 'markdown', ...nextMarkdown }
        : nextRawUrl
          ? { kind: 'rawUrl', ...nextRawUrl }
          : null;

    if (!nextToken) break;

    pushTextToken(tokens, text.slice(cursor, nextToken.start), bold);
    if (nextToken.value) {
      tokens.push({
        type: 'link',
        value: nextToken.value,
        href: nextToken.href,
        bold,
      });
    }
    if (nextToken.kind === 'rawUrl') {
      pushTextToken(tokens, nextToken.trailing, bold);
    }
    cursor = nextToken.end;
  }

  pushTextToken(tokens, text.slice(cursor), bold);
}

export function tokenizeInlineText(value) {
  const text = String(value ?? '');
  const tokens = [];
  const lines = text.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const boldPattern = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match = boldPattern.exec(line);

    while (match) {
      pushLinkTokens(tokens, line.slice(lastIndex, match.index));
      pushLinkTokens(tokens, match[1], true);
      lastIndex = match.index + match[0].length;
      match = boldPattern.exec(line);
    }

    pushLinkTokens(tokens, line.slice(lastIndex));

    if (lineIndex < lines.length - 1) {
      tokens.push({ type: 'lineBreak' });
    }
  }

  return tokens;
}
