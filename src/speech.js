export function getSpeechRecognitionCtor(win = typeof window === 'undefined' ? undefined : window) {
  if (!win) return null;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function supportsSpeechRecognition(win = typeof window === 'undefined' ? undefined : window) {
  return typeof getSpeechRecognitionCtor(win) === 'function';
}
