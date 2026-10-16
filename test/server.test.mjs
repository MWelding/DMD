import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';
import { exhibits, eras } from '../src/content.js';
import { access } from 'node:fs/promises';
test('installation serves its entry, modules, content and assets', async t => {
  const server = createServer(); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['/','/src/app.js','/src/styles.css','/assets/station.jpg']) assert.equal((await fetch(base+path)).status,200,path);
  const res = await fetch(base+'/api/exhibits'); assert.deepEqual(await res.json(),exhibits);
  assert.equal((await fetch(base+'/missing')).status,404);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
  assert.equal((await fetch(base+'/assets/%2e%2e%2f%2e%2e%2fpackage.json')).status,403);
  assert.equal((await fetch(base+'/src/%2e%2e%2fserver.mjs')).status,403);
  assert.equal((await fetch(base+'/',{method:'HEAD'})).status,200);
});
test('every exhibit has real paired assets and complete interpretation', async () => {
  assert.equal(eras.length,3); assert.equal(Object.keys(exhibits).length,4);
  for (const item of Object.values(exhibits)) {
    assert.ok(item.past && item.present && item.credit && item.question);
    assert.equal(item.images.length,2);
    for(const file of item.images) await access(new URL(`../public/assets/${file}`,import.meta.url));
  }
});
