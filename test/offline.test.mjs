import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Script } from 'node:vm';
import { buildOffline } from '../scripts/build-offline.mjs';
import { offlinePageWithState, applyOfflineImages } from '../src/offline-editor.js';
import { parsePanelText, serializePanelText, PanelTextStore } from '../src/panel-text.js';
import { assetURL } from '../src/assets.js';
import { exhibits } from '../src/content.js';
import { chapters } from '../src/chapters.js';

const readState = html => JSON.parse(html.match(/<script id="offline-state" type="application\/json">([\s\S]*?)<\/script>/)[1]);

test('offline asset resolver retains normal URLs and accepts embedded or replacement images', () => {
  assert.equal(assetURL('train-past.png'), '/assets/train-past.png');
  const original = globalThis.__OFFLINE_ASSETS__;
  try {
    globalThis.__OFFLINE_ASSETS__ = { '/assets/train-past.png': 'data:image/png;base64,AA==' };
    assert.equal(assetURL('train-past.png'), 'data:image/png;base64,AA==');
    assert.equal(assetURL('/assets/train-past.png'), 'data:image/png;base64,AA==');
    assert.equal(assetURL('data:image/jpeg;base64,BB=='), 'data:image/jpeg;base64,BB==');
  } finally { if (original === undefined) delete globalThis.__OFFLINE_ASSETS__; else globalThis.__OFFLINE_ASSETS__ = original; }
});

test('text editor round-trips blank sections, Unicode, paragraphs and punctuation', () => {
  const values = parsePanelText('[train.title]\nRīga <then & now>\n\n[train.past.text]\nFirst.\n\nSecond.\n\n[bus.intro]\n');
  assert.deepEqual(parsePanelText(serializePanelText(values)), values);
});

test('an image-only edit is applied even when its text has not changed', async () => {
  const session = { text: '[train.title]\nMy train', cardImages: {} };
  const store = new PanelTextStore({ exhibits, chapters, load: async () => session.text, transform: content => applyOfflineImages(content, session.cardImages) });
  await store.refresh();
  session.cardImages['train.1'] = 'data:image/png;base64,AA==';
  assert.equal(await store.refresh(true), true);
  assert.equal(store.chapters.train[1].image, session.cardImages['train.1']);
  assert.equal(store.chapters.train[0].image, chapters.train[0].image);
  const copy = structuredClone({ exhibits, chapters });
  applyOfflineImages(copy, { 'bus.0': 'https://external.example/image.jpg', 'train.4': 'data:image/png;base64,AA==' });
  assert.deepEqual(copy, { exhibits, chapters });
});

test('standalone HTML embeds its assets, has no module or stylesheet requests, and saves a clean edited copy', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'dmd-offline-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const { html, assets, state } = await buildOffline({ output: join(folder, 'offline.html') });
  assert.doesNotMatch(html, /<script\b[^>]*\ssrc=/i);
  assert.doesNotMatch(html, /<script\b[^>]*type="module"/i);
  assert.doesNotMatch(html, /<link[^>]*rel="(?:stylesheet|preload)"/i);
  assert.doesNotMatch(html, /<img\b[^>]*\ssrc="\/(?:assets|src)\//i);
  assert.doesNotMatch(html, /@import\s+url/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /data:font\/ttf;base64,/);
  assert.match(html, /SIL OPEN FONT LICENSE/);
  assert.ok(assets['/assets/journey/city-panorama.jpg'], 'moving city approach is embedded');
  for (let index = 0; index < 12; index++) assert.ok(assets[`/assets/journey/arrival-${String(index).padStart(2, '0')}.jpg`]);
  for (const stops of Object.values(chapters)) for (const chapter of stops) assert.ok(assets['/assets/' + chapter.image]);
  for (const match of html.matchAll(/data-offline-src="([^"]+)"/g)) assert.ok(assets[match[1]], match[1]);
  const script = html.match(/<script id="offline-app">([\s\S]*?)<\/script>/)[1];
  new Script(script, { filename: 'offline-html.js' });
  const edited = { text: '[train.title]\nSaved offline — </script><img src=x>\n', cardImages: { 'train.1': 'data:image/png;base64,AA==' } };
  const saved = offlinePageWithState(html, edited);
  assert.deepEqual(readState(saved), { version: 1, ...edited });
  assert.equal((saved.match(/id="offline-assets"/g) || []).length, 1, 'assets are not duplicated by saving');
  assert.equal((saved.match(/id="offline-app"/g) || []).length, 1, 'app is not duplicated by saving');
  assert.ok(saved.length < html.length + 1000, 'save changes the content payload instead of serializing the rendered collage');
  assert.equal(readState(html).text, state.text, 'original file remains unchanged');
  assert.throws(() => offlinePageWithState('<html></html>', edited), /template is missing/);
});
