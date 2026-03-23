import { describe, expect, it } from 'vitest';
import { parseVoicePhoneNumber } from './voice-phone.js';

describe('parseVoicePhoneNumber', () => {
  it('returns null for non-strings and empty', () => {
    expect(parseVoicePhoneNumber(null)).toBeNull();
    expect(parseVoicePhoneNumber(undefined)).toBeNull();
    expect(parseVoicePhoneNumber(123)).toBeNull();
    expect(parseVoicePhoneNumber('')).toBeNull();
    expect(parseVoicePhoneNumber('   ')).toBeNull();
  });

  it('normalizes US 10-digit national to +1 and pretty display', () => {
    expect(parseVoicePhoneNumber('7867553623')).toEqual({
      telHref: 'tel:+17867553623',
      display: '(786) 755-3623',
    });
  });

  it('accepts formatted US input', () => {
    expect(parseVoicePhoneNumber('(786) 755-3623')).toEqual({
      telHref: 'tel:+17867553623',
      display: '(786) 755-3623',
    });
  });

  it('accepts explicit E.164 with plus', () => {
    expect(parseVoicePhoneNumber('+17867553623')).toEqual({
      telHref: 'tel:+17867553623',
      display: '(786) 755-3623',
    });
  });

  it('accepts 11-digit US with leading 1', () => {
    expect(parseVoicePhoneNumber('17867553623')).toEqual({
      telHref: 'tel:+17867553623',
      display: '(786) 755-3623',
    });
  });

  it('returns null for too few digits', () => {
    expect(parseVoicePhoneNumber('12345')).toBeNull();
    expect(parseVoicePhoneNumber('+12345')).toBeNull();
  });

  it('accepts international with plus', () => {
    expect(parseVoicePhoneNumber('+447700900123')).toEqual({
      telHref: 'tel:+447700900123',
      display: '+447700900123',
    });
  });
});
