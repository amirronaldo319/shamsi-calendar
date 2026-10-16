import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Runs sw.js against minimal fakes of the service-worker globals.
function boot({ online }) {
  const store = new Map();               // cache name -> Map(url -> response)
  const listeners = {};
  const fetched = [];
  const caches = {
    open: async (name) => {
      if (!store.has(name)) store.set(name, new Map());
      const m = store.get(name);
      return {
        addAll: async (urls) => { for (const u of urls) m.set(new URL(u, 'https://x.test/').href, { ok: true, body: `cached:${u}`, clone() { return this; } }); },
        match: async (req) => m.get(typeof req === 'string' ? req : req.url),
        put: async (req, res) => { m.set(req.url, res); },
      };
    },
    keys: async () => [...store.keys()],
    delete: async (k) => store.delete(k),
  };
  const self = {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting: async () => {}, clients: { claim: async () => {} },
  };
  const ctx = {
    self, caches, URL, Promise,
    location: { origin: 'https://x.test' },
    fetch: async (req) => { fetched.push(req.url); if (!online.value) throw new Error('offline'); return { ok: true, body: `net:${req.url}`, clone() { return this; } }; },
  };
  vm.runInNewContext(fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), ctx);
  const run = (type, event) => new Promise((resolve) => { let p; listeners[type]({ ...event, waitUntil: (x) => { p = x; }, respondWith: (x) => { p = x; } }); resolve(p); }).then((p) => p);
  return { run, store, fetched };
}

test('installs the app shell, then serves pages and fonts while offline', async () => {
  const online = { value: true };
  const sw = boot({ online });
  await sw.run('install', {});
  const cache = sw.store.get('shamsi-v1');
  for (const asset of ['index.html', 'app.js', 'calendar.js', 'i18n.js', 'styles.css', 'fonts/vazirmatn.ttf', 'fonts/baloo.ttf', 'icons/icon-192.png', 'manifest.webmanifest']) {
    assert.ok(cache.has(new URL(asset, 'https://x.test/').href), `precached ${asset}`);
  }
  online.value = false;
  const res = await sw.run('fetch', { request: { method: 'GET', url: 'https://x.test/app.js' } });
  assert.equal(res.body, 'cached:app.js');
});

test('ignores non-GET and cross-origin requests', async () => {
  const sw = boot({ online: { value: true } });
  // A handler that never calls respondWith leaves the request to the browser.
  const result = await sw.run('fetch', { request: { method: 'POST', url: 'https://x.test/a' } });
  assert.equal(result, undefined);
  const other = await sw.run('fetch', { request: { method: 'GET', url: 'https://other.test/a' } });
  assert.equal(other, undefined);
});

test('activation removes old caches', async () => {
  const sw = boot({ online: { value: true } });
  sw.store.set('shamsi-v0', new Map());
  await sw.run('install', {});
  await sw.run('activate', {});
  assert.deepEqual([...sw.store.keys()], ['shamsi-v1']);
});
