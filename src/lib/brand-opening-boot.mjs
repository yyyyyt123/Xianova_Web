export function openingStorageKey(basePath = '') {
  return 'xianova:brand-opening:v1' + (basePath ? ':' + basePath.replace(/\/$/, '') : '');
}
export const OPENING_STORAGE_KEY = openingStorageKey(process.env.NEXT_PUBLIC_BASE_PATH || '');

// Runs synchronously in <head>, before the browser can paint the homepage.
// It only selects a presentation state; React owns playback and session storage.
export function createOpeningBootScript(basePath = '') {
  const prefix = basePath.replace(/\/$/, '');
  return `(() => {
  const root = document.documentElement;
  try {
    const prefix = ${JSON.stringify(prefix)};
    const pathname = prefix && (location.pathname === prefix || location.pathname.startsWith(prefix + '/')) ? location.pathname.slice(prefix.length) || '/' : location.pathname;
    const home = /^\\/(zh|en)\\/?$/.test(pathname) || pathname === '/';
    const restored = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    let seen = false;
    try { seen = sessionStorage.getItem(${JSON.stringify(openingStorageKey(prefix))}) === '1'; } catch {}
    if (!home || seen || location.hash || restored || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.setAttribute('data-brand-opening', 'pending');
    // A failed / blocked application bundle must not leave the site covered.
    setTimeout(() => {
      if (root.getAttribute('data-brand-opening') === 'pending') root.setAttribute('data-brand-opening', 'expired');
    }, 8000);
  } catch { root.removeAttribute('data-brand-opening'); }
})();`;
}
export const OPENING_BOOT_SCRIPT = createOpeningBootScript(process.env.NEXT_PUBLIC_BASE_PATH || '');

// Inline critical styles keep the very first paint covered, before hydration.
// With JS disabled or the bootstrap blocked, no attribute is set and content stays visible.
export const OPENING_BOOT_STYLES = `
.brand-opening[data-phase="pending"]{display:none}
html[data-brand-opening="pending"]{overflow:hidden}
html[data-brand-opening="pending"] .brand-opening[data-phase="pending"]{display:block;position:fixed;inset:0;z-index:100;background:#f9fbfc}
html[data-brand-opening="pending"] :is(.site-header,#main-content,.site-footer,.skip-link){visibility:hidden}
@media(prefers-reduced-motion:reduce){html[data-brand-opening="pending"] .brand-opening[data-phase="pending"]{display:none}html[data-brand-opening="pending"] :is(.site-header,#main-content,.site-footer,.skip-link){visibility:visible}html[data-brand-opening="pending"]{overflow:visible}}
`;
