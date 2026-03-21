export function shouldShowImagePreview(att) {
  if (!att || typeof att.data_url !== 'string' || !att.data_url) return false;
  const mime = String(att.mime_type || '');
  if (mime.startsWith('image/')) return true;
  return /^data:image\//i.test(att.data_url);
}
