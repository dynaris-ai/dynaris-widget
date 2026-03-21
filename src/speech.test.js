import { describe, expect, it } from 'vitest';
import { getSpeechRecognitionCtor, supportsSpeechRecognition } from './speech.js';

describe('speech helpers', () => {
  it('returns null when speech recognition is unavailable', () => {
    expect(getSpeechRecognitionCtor({})).toBeNull();
    expect(supportsSpeechRecognition({})).toBe(false);
  });

  it('prefers SpeechRecognition when available', () => {
    function SpeechRecognition() {}
    function WebkitSpeechRecognition() {}

    expect(getSpeechRecognitionCtor({
      SpeechRecognition,
      webkitSpeechRecognition: WebkitSpeechRecognition,
    })).toBe(SpeechRecognition);
    expect(supportsSpeechRecognition({ SpeechRecognition })).toBe(true);
  });

  it('uses webkitSpeechRecognition when needed', () => {
    function WebkitSpeechRecognition() {}

    expect(getSpeechRecognitionCtor({ webkitSpeechRecognition: WebkitSpeechRecognition })).toBe(
      WebkitSpeechRecognition
    );
    expect(supportsSpeechRecognition({ webkitSpeechRecognition: WebkitSpeechRecognition })).toBe(
      true
    );
  });
});
