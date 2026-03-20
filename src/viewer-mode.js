/** @typedef {'embed' | 'mobile-app'} ViewerMode */

/** @type {ViewerMode} */
export const VIEWER_EMBED = 'embed';

/** @type {ViewerMode} */
export const VIEWER_MOBILE_APP = 'mobile-app';

/**
 * @param {unknown} viewer
 * @returns {ViewerMode}
 */
export function normalizeViewerMode(viewer) {
  if (viewer === VIEWER_MOBILE_APP || viewer === 'mobile_app') {
    return VIEWER_MOBILE_APP;
  }
  return VIEWER_EMBED;
}
