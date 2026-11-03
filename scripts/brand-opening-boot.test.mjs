import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { OPENING_BOOT_SCRIPT, OPENING_STORAGE_KEY } from '../src/lib/brand-opening-boot.mjs';

function boot(options = {}) {
  const attributes = new Map();
  const timers = [];
  const root = {
    setAttribute: (key, value) => attributes.set(key, value),
    getAttribute: key => attributes.get(key) ?? null,
    removeAttribute: key => attributes.delete(key),
  };
  runInNewContext(OPENING_BOOT_SCRIPT, {
    document: { documentElement: root, hidden: options.hidden ?? false },
    location: { pathname: options.path ?? '/zh', hash: options.hash ?? '' },
    performance: { getEntriesByType: () => [{ type: options.navigation ?? 'navigate' }] },
    matchMedia: () => ({ matches: options.reduced ?? false }),
    sessionStorage: { getItem(key) {
      assert.equal(key, OPENING_STORAGE_KEY);
      if (options.storageBlocked) throw new Error('Storage unavailable');
      return options.seen ? '1' : null;
    } },
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
  });
  return { root, timers, state: () => root.getAttribute('data-brand-opening') };
}

test('first homepage entry is covered synchronously, before application hydration', () => {
  for (const path of ['/zh', '/en', '/zh/', '/']) assert.equal(boot({ path }).state(), 'pending');
});

test('repeat visits, anchors, inner pages and history restores stay visible immediately', () => {
  for (const options of [{ seen: true }, { hash: '#research-notes' }, { path: '/zh/about' }, { path: '/en/careers' }, { navigation: 'back_forward' }]) {
    const entry = boot(options);
    assert.equal(entry.state(), null);
    assert.equal(entry.timers.length, 0);
  }
});

test('reduced motion and background entry do not cover the page', () => {
  assert.equal(boot({ reduced: true }).state(), null);
  assert.equal(boot({ hidden: true }).state(), null);
});

test('blocked session storage still allows a first opening', () => {
  assert.equal(boot({ storageBlocked: true }).state(), 'pending');
});

test('a missing application bundle releases the initial cover after a bounded wait', () => {
  const entry = boot();
  assert.equal(entry.timers[0].delay, 8000);
  entry.timers[0].callback();
  assert.equal(entry.state(), 'expired');
});

test('the bootstrap deadline cannot interrupt playback or reinstate a finished opening', () => {
  const active = boot();
  active.root.setAttribute('data-brand-opening', 'active');
  active.timers[0].callback();
  assert.equal(active.state(), 'active');
  const finished = boot();
  finished.root.removeAttribute('data-brand-opening');
  finished.timers[0].callback();
  assert.equal(finished.state(), null);
});
