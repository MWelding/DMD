import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const safeJSON = value => JSON.stringify(value).replace(/</g, '\\u003c');
const idFor = path => relative(root, path).split(sep).join('/');

// This project uses only named relative imports and declaration exports. Fail on
// other syntax instead of silently producing an incomplete standalone file.
export async function bundleModules(entry = resolve(root, 'src/experience.js')) {
  const factories = new Map();
  async function visit(path) {
    const id = idFor(path);
    if (factories.has(id)) return;
    factories.set(id, '');
    let code = await readFile(path, 'utf8');
    const imports = [...code.matchAll(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/gm)];
    for (const match of imports) {
      if (!match[2].startsWith('.')) throw new Error(`External module not supported: ${match[2]}`);
      const dependency = resolve(dirname(path), match[2]);
      if (!dependency.startsWith(resolve(root, 'src') + sep)) throw new Error('Module outside src/');
      await visit(dependency);
      const bindings = match[1].trim().replace(/\s+as\s+/g, ': ');
      code = code.replace(match[0], () => `const { ${bindings} } = require(${JSON.stringify(idFor(dependency))});\n`);
    }
    const exports = [];
    code = code.replace(/^export\s+((?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*))/gm, (_, declaration, name) => { exports.push(name); return declaration; });
    if (/^\s*(?:import|export)\s/m.test(code)) throw new Error(`Unsupported module syntax in ${id}`);
    factories.set(id, `function(require){\n${code}\nreturn { ${exports.join(', ')} };\n}`);
  }
  await visit(entry);
  const bundle = `const __factories = {\n${[...factories].map(([id, code]) => `${JSON.stringify(id)}: ${code}`).join(',\n')}\n};
const __cache = Object.create(null);
function __require(id){if(__cache[id])return __cache[id];if(!__factories[id])throw new Error('Missing module: '+id);return __cache[id]=__factories[id](__require);}
__require(${JSON.stringify(idFor(entry))});`;
  new Script(bundle, { filename: 'offline-bundle.js' });
  return bundle;
}

async function dataURL(path) {
  const type = types[extname(path).toLowerCase()];
  if (!type) throw new Error(`Unsupported embedded asset: ${path}`);
  return `data:${type};base64,${(await readFile(path)).toString('base64')}`;
}

async function inlineCSS(path, seen = new Set()) {
  if (seen.has(path)) return '';
  seen.add(path);
  let css = await readFile(path, 'utf8');
  for (const match of [...css.matchAll(/@import\s+url\(['"]?([^'"\)]+)['"]?\);/g)]) {
    const imported = await inlineCSS(resolve(dirname(path), match[1]), seen);
    css = css.replace(match[0], () => imported);
  }
  for (const match of [...css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\)\s]+))\s*\)/g)]) {
    const file = match[1] ?? match[2] ?? match[3];
    if (file.startsWith('data:') || file.startsWith('#')) continue;
    const asset = file.startsWith('/assets/') ? resolve(root, 'public', '.' + file) : resolve(dirname(path), file);
    const url = await dataURL(asset);
    css = css.replace(match[0], () => `url("${url}")`);
  }
  return css;
}

export async function buildOffline({ output = resolve(root, 'offline/START-HERE.html') } = {}) {
  const assets = {};
  async function embedFolder(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = resolve(folder, entry.name);
      if (entry.isDirectory()) await embedFolder(path);
      else if (types[extname(path).toLowerCase()]?.startsWith('image/')) assets['/' + relative(resolve(root, 'public'), path).split(sep).join('/')] = await dataURL(path);
    }
  }
  await embedFolder(resolve(root, 'public/assets'));
  let html = await readFile(resolve(root, 'public/index.html'), 'utf8');
  for (const match of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"\s*\/?\s*>/g)]) {
    const path = resolve(root, '.' + match[1].split('?')[0]);
    const css = await inlineCSS(path);
    html = html.replace(match[0], () => `<style>\n${css}\n</style>`);
  }
  html = html.replace(/<link rel="preload"[^>]*>/g, '')
    .replace('href="/assets/favicon.svg"', `href="${assets['/assets/favicon.svg']}"`)
    .replace(/src="(\/assets\/[^"]+)"/g, 'data-offline-src="$1"')
    .replace(/<script type="module" src="[^"]+"><\/script>/, '');
  const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; media-src data: blob:; object-src 'none'">`;
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">' + policy);
  const editorCSS = await readFile(resolve(root, 'src/offline-editor.css'), 'utf8');
  html = html.replace('</head>', () => `<style>${editorCSS}</style></head>`);
  const state = { version: 1, text: await readFile(resolve(root, 'PANEL-TEXT.txt'), 'utf8'), cardImages: {} };
  const boot = `(() => { 'use strict';
const template = '<!doctype html>' + document.documentElement.outerHTML;
globalThis.__OFFLINE_ASSETS__ = JSON.parse(document.getElementById('offline-assets').textContent);
globalThis.__OFFLINE_SESSION__ = {...JSON.parse(document.getElementById('offline-state').textContent),template};
for(const image of document.querySelectorAll('[data-offline-src]')){const url=globalThis.__OFFLINE_ASSETS__[image.dataset.offlineSrc];if(!url)throw new Error('Missing embedded image: '+image.dataset.offlineSrc);image.src=url;}
${await bundleModules()}
})();`.replace(/<\/script/gi, '<\\/script');
  const notices = { font: 'Anton', license: await readFile(resolve(root, 'public/assets/Anton-OFL.txt'), 'utf8') };
  const scripts = `<script id="offline-assets" type="application/json">${safeJSON(assets)}</script>\n<script id="offline-state" type="application/json">${safeJSON(state)}</script>\n<script id="offline-notices" type="application/json">${safeJSON(notices)}</script>\n<script id="offline-app">${boot}</script>`;
  html = html.replace('</body>', () => scripts + '\n</body>');
  new Script(html.match(/<script id="offline-app">([\s\S]*?)<\/script>/)[1], { filename: 'offline-html.js' });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  console.log(`Offline HTML: ${relative(root, output)} — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB, ${Object.keys(assets).length} embedded images.`);
  return { html, assets, state };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildOffline();
