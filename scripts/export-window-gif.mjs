// Export the real TrainView drawing code at deterministic timestamps.
// node scripts/export-window-gif.mjs --canvas-module PATH_TO_@napi-rs/canvas
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TrainView } from '../src/train-view.js';

const require = createRequire(import.meta.url);
const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const { createCanvas, loadImage } = require(argument('--canvas-module') || '@napi-rs/canvas');
const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(argument('--output') || resolve(root, '../Illustration Material'));
await mkdir(output, { recursive: true });
const large = process.argv.includes('--large');
const width = large ? 960 : 640, height = large ? 440 : 294, fps = large ? 20 : 12, seconds = 10;
const canvas = createCanvas(width, height);
const exportCanvas = createCanvas(width, height);
const exportContext = exportCanvas.getContext('2d');
const image = await loadImage(resolve(root, 'public/assets/journey/countryside-panorama.png'));
// Use the production renderer itself; no browser timer or UI is needed for export.
const view = Object.assign(Object.create(TrainView.prototype), {
  canvas, context: canvas.getContext('2d'), image, width, height, loaded: true, distance: 0
});
const target = resolve(output, large ? 'train-window-scenery-large.gif' : 'train-window-scenery.gif');
const encoder = spawn(argument('--ffmpeg') || 'ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${width}x${height}`,
  '-framerate', String(fps), '-i', 'pipe:0',
  '-filter_complex', large
    ? '[0:v]split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle'
    : '[0:v]split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=none',
  '-loop', '0', target
], { stdio: ['pipe', 'inherit', 'inherit'] });
const completed = once(encoder, 'close');
encoder.stdin.on('error', () => {});
for (let frame = 0; frame < fps * seconds; frame++) {
  // Full cruising speed: 270 world pixels per second, as in TrainView.tick().
  view.distance = frame / fps * 270;
  view.paint();
  exportContext.filter = 'brightness(0.9) saturate(0.8)';
  exportContext.drawImage(canvas, 0, 0);
  if (frame === fps * 2) await writeFile(resolve(output, 'train-window-scenery-preview.png'), exportCanvas.toBuffer('image/png'));
  const pixels = exportContext.getImageData(0, 0, width, height).data;
  if (!encoder.stdin.write(Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength))) await once(encoder.stdin, 'drain');
  if (frame % fps === 0) console.log(`Rendered ${frame / fps}/${seconds} seconds`);
}
encoder.stdin.end();
const [code] = await completed;
if (code !== 0) throw new Error(`GIF encoder exited with code ${code}`);
console.log(`Saved ${target} (${width} × ${height}, ${fps} fps, ${seconds} seconds).`);
