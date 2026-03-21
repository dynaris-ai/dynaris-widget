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

function pushLinkTokens(tokens, value, bold = false) {
  const text = String(value || '');
  let lastIndex = 0;
  let match = URL_PATTERN.exec(text);

  while (match) {
    const rawUrl = match[0];
    const start = match.index;
    const end = start + rawUrl.length;
    const { url, trailing } = splitTrailingUrlPunctuation(rawUrl);

    pushTextToken(tokens, text.slice(lastIndex, start), bold);
    if (url) {
      tokens.push({ type: 'link', value: url, href: url, bold });
    }
    pushTextToken(tokens, trailing, bold);

    lastIndex = end;
    match = URL_PATTERN.exec(text);
  }

  pushTextToken(tokens, text.slice(lastIndex), bold);
  URL_PATTERN.lastIndex = 0;
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
