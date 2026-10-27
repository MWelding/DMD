import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exhibits } from '../src/content.js';
import { chapters } from '../src/chapters.js';
import { applyPanelText, loadPanelText, PanelTextStore } from '../src/panel-text.js';
import { createServer } from '../server.mjs';

test('the editable file preserves all current copy and image choices', async () => {
  const text = await readFile(new URL('../PANEL-TEXT.txt', import.meta.url), 'utf8');
  assert.deepEqual(applyPanelText(text, exhibits, chapters), { exhibits, chapters });
});

test('plain text supports paragraphs, punctuation, Unicode and deliberately empty copy', () => {
  const text = '\uFEFF; Editor notes\r\n[train.title]\r\nRīga & trains <then / now>\r\n\r\n[train.past.text]\r\nOne paragraph.\r\n\r\nAnother “paragraph”.\r\n[train.intro]\r\n';
  const edited = applyPanelText(text, exhibits, chapters);
  assert.equal(edited.exhibits.train.title, 'Rīga & trains <then / now>');
  assert.equal(edited.exhibits.train.intro, '');
  assert.equal(edited.chapters.train[0].text, 'One paragraph.\n\nAnother “paragraph”.');
  assert.equal(edited.chapters.train[0].image, chapters.train[0].image);
  assert.deepEqual(edited.exhibits.bus, exhibits.bus);
  assert.notEqual(edited.exhibits.train.title, exhibits.train.title, 'defaults are not mutated');
});

test('saved changes replace old copy; an invalid save keeps the last good version', async () => {
  let text = '[train.title]\nFirst title', updates = 0;
  const store = new PanelTextStore({ exhibits, chapters, load: async () => text, onChange: () => updates++ });
  assert.equal(await store.refresh(), true);
  assert.equal(await store.refresh(), false);
  text = '[train.title]\nNew title\n[train.present.year]\nNow';
  assert.equal(await store.refresh(), true);
  assert.equal(store.exhibits.train.title, 'New title');
  assert.equal(store.chapters.train[2].year, 'Now');
  text = '[train.typo]\nWrong heading';
  assert.equal(await store.refresh(), false);
  assert.equal(store.exhibits.train.title, 'New title');
  assert.equal(updates, 2);
  assert.throws(() => applyPanelText('[train.title]\nOne\n[train.title]\nTwo', exhibits, chapters), /Duplicate/);
});

test('static hosting falls back to the exported text file without caching', async () => {
  const urls = [];
  const text = await loadPanelText(async (url, options) => {
    urls.push(url);
    assert.equal(options.cache, 'no-store');
    return url.startsWith('/api/') ? { status: 404 } : { ok: true, text: async () => '[bus.title]\nA bus' };
  });
  assert.deepEqual(urls, ['/api/panel-text', '/panel-text.txt']);
  assert.equal(text, '[bus.title]\nA bus');
});

test('development and production read fresh saved text without a restart or build', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'collage-panel-text-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const panelTextFile = join(folder, 'PANEL-TEXT.txt');
  for (const production of [false, true]) {
    await writeFile(panelTextFile, '[train.title]\nBefore');
    const server = createServer({ production, panelTextFile });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const initial = await fetch(base + '/api/panel-text');
      assert.equal(initial.headers.get('cache-control'), 'no-store');
      assert.match(await initial.text(), /Before/);
      await writeFile(panelTextFile, '[train.title]\nAfter saving — Rīga');
      assert.match(await (await fetch(base + '/api/panel-text')).text(), /After saving — Rīga/);
      assert.match(await (await fetch(base + '/panel-text.txt')).text(), /After saving — Rīga/);
      const head = await fetch(base + '/api/panel-text', { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
    } finally { await new Promise(resolve => server.close(resolve)); }
  }
});
