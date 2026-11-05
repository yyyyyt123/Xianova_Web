import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { OPENING_BOOT_SCRIPT, OPENING_STORAGE_KEY, createOpeningBootScript, openingStorageKey } from '../src/lib/brand-opening-boot.mjs';

function boot(options = {}) {
  const attributes = new Map();
  const timers = [];
  const root = {
    setAttribute: (key, value) => attributes.set(key, value),
    getAttribute: key => attributes.get(key) ?? null,
    removeAttribute: key => attributes.delete(key),
  };
  runInNewContext(options.basePath ? createOpeningBootScript(options.basePath) : OPENING_BOOT_SCRIPT, {
    document: { documentElement: root, hidden: options.hidden ?? false },
    location: { pathname: options.path ?? '/zh', hash: options.hash ?? '' },
    performance: { getEntriesByType: () => [{ type: options.navigation ?? 'navigate' }] },
    matchMedia: () => ({ matches: options.reduced ?? false }),
    sessionStorage: { getItem(key) {
      assert.equal(key, options.basePath ? openingStorageKey(options.basePath) : OPENING_STORAGE_KEY);
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

test('preview base paths cover language homepages before hydration', () => {
  for (const path of ['/xianova-preview', '/xianova-preview/', '/xianova-preview/zh', '/xianova-preview/en/']) {
    assert.equal(boot({path, basePath: '/xianova-preview'}).state(), 'pending');
  }
  for (const path of ['/xianova-preview/zh/about', '/xianova-preview/en/careers', '/xianova-preview-other/zh']) {
    assert.equal(boot({path, basePath: '/xianova-preview'}).state(), null);
  }
});

test('preview opening state is separate and preserves navigation exclusions', () => {
  assert.notEqual(openingStorageKey('/xianova-preview'), OPENING_STORAGE_KEY);
  for (const options of [{seen:true},{hidden:true},{reduced:true},{hash:'#perspective'},{navigation:'back_forward'}]) {
    assert.equal(boot({...options,path:'/xianova-preview/zh',basePath:'/xianova-preview'}).state(),null);
  }
  const missing = boot({path:'/xianova-preview/zh',basePath:'/xianova-preview'});
  missing.timers[0].callback();
  assert.equal(missing.state(),'expired');
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
