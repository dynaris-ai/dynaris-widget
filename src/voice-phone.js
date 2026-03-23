const ITU_MIN_DIGITS = 8;
const ITU_MAX_DIGITS = 15;

function digitCharsOnly(value) {
  return value.replace(/\D/g, '');
}

function formatUsNationalTen(digits10) {
  if (digits10.length !== 10) {
    return digits10;
  }
  return `(${digits10.slice(0, 3)}) ${digits10.slice(3, 6)}-${digits10.slice(6)}`;
}

/**
 * @param {unknown} raw
 * @returns {{ telHref: string, display: string } | null}
 */
export function parseVoicePhoneNumber(raw) {
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  if (trimmed.startsWith('+')) {
    const d = digitCharsOnly(trimmed.slice(1));
    if (d.length < ITU_MIN_DIGITS || d.length > ITU_MAX_DIGITS) {
      return null;
    }
    let display;
    if (d.length === 11 && d.startsWith('1')) {
      display = formatUsNationalTen(d.slice(1));
    } else {
      display = `+${d}`;
    }
    return { telHref: `tel:+${d}`, display };
  }

  const d = digitCharsOnly(trimmed);
  if (d.length === 10) {
    return { telHref: `tel:+1${d}`, display: formatUsNationalTen(d) };
  }
  if (d.length === 11 && d.startsWith('1')) {
    const national = d.slice(1);
    return { telHref: `tel:+${d}`, display: formatUsNationalTen(national) };
  }
  if (d.length >= ITU_MIN_DIGITS && d.length <= ITU_MAX_DIGITS) {
    return { telHref: `tel:+${d}`, display: `+${d}` };
  }
  return null;
}
