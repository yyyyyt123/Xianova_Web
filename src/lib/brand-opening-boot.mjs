export const OPENING_STORAGE_KEY = 'xianova:brand-opening:v1';

// Runs synchronously in <head>, before the browser can paint the homepage.
// It only selects a presentation state; React owns playback and session storage.
export const OPENING_BOOT_SCRIPT = `(() => {
  const root = document.documentElement;
  try {
    const home = /^\\/(zh|en)\\/?$/.test(location.pathname) || location.pathname === '/';
    const restored = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    let seen = false;
    try { seen = sessionStorage.getItem('${OPENING_STORAGE_KEY}') === '1'; } catch {}
    if (!home || seen || location.hash || restored || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.setAttribute('data-brand-opening', 'pending');
    // A failed / blocked application bundle must not leave the site covered.
    setTimeout(() => {
      if (root.getAttribute('data-brand-opening') === 'pending') root.setAttribute('data-brand-opening', 'expired');
    }, 8000);
  } catch { root.removeAttribute('data-brand-opening'); }
})();`;

// Inline critical styles keep the very first paint covered, before hydration.
// With JS disabled or the bootstrap blocked, no attribute is set and content stays visible.
export const OPENING_BOOT_STYLES = `
.brand-opening[data-phase="pending"]{display:none}
html[data-brand-opening="pending"]{overflow:hidden}
html[data-brand-opening="pending"] .brand-opening[data-phase="pending"]{display:block;position:fixed;inset:0;z-index:100;background:#f9fbfc}
html[data-brand-opening="pending"] :is(.site-header,#main-content,.site-footer,.skip-link){visibility:hidden}
@media(prefers-reduced-motion:reduce){html[data-brand-opening="pending"] .brand-opening[data-phase="pending"]{display:none}html[data-brand-opening="pending"] :is(.site-header,#main-content,.site-footer,.skip-link){visibility:visible}html[data-brand-opening="pending"]{overflow:visible}}
`;
