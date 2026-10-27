import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chapters } from '../src/chapters.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const docs = (await readdir(root)).filter(name => name.endsWith('.md'));
let checked = 0;
const failures = [];
for (const file of docs) {
  const markdown = await readFile(resolve(root, file), 'utf8');
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const link = match[1].replace(/^<|>$/g, '');
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    const path = resolve(dirname(resolve(root, file)), decodeURIComponent(link.split('#')[0]));
    try { await stat(path); checked++; }
    catch { failures.push(`${file}: missing ${relative(root, path)}`); }
  }
}
// The README card-image table must stay in sync with the actual panel images.
const readme = await readFile(resolve(root, 'README.md'), 'utf8');
for (const [id, stops] of Object.entries(chapters)) {
  for (const chapter of stops) {
    const image = `public/assets/${chapter.image}`;
    if (!readme.includes(`](${image})`)) failures.push(`README.md: ${id} card image is not linked: ${image}`);
  }
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Checked ${checked} local documentation links and all 12 card-image mappings.`);
