const objects = ['train', 'tram', 'bus', 'station'];
const periods = ['past', 'transition', 'present'];
const panelFields = ['category', 'title', 'intro'];
const chapterFields = ['year', 'title', 'label', 'caption', 'text'];
const allowedKeys = new Set(objects.flatMap(id => [
  ...panelFields.map(field => `${id}.${field}`),
  ...periods.flatMap(period => chapterFields.map(field => `${id}.${period}.${field}`))
]));

// Plain text between [section.name] headings; no quotes, commas or HTML needed.
export function parsePanelText(text) {
  const values = new Map();
  let key, lines = [];
  const save = () => { if (key) values.set(key, lines.join('\n').trim()); };
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    if (line.trimStart().startsWith(';')) continue;
    const heading = line.match(/^\[([a-z.]+)\]\s*$/);
    if (heading) {
      save();
      key = heading[1];
      if (!allowedKeys.has(key)) throw new Error(`Unknown text heading: [${key}]`);
      if (values.has(key)) throw new Error(`Duplicate text heading: [${key}]`);
      lines = [];
    } else if (key) lines.push(line);
    else if (line.trim()) throw new Error('Keep the text below a [section.name] heading.');
  }
  save();
  if (!values.size) throw new Error('The panel text file contains no sections.');
  return values;
}

export function applyPanelText(text, originalExhibits, originalChapters) {
  const values = parsePanelText(text);
  const exhibits = structuredClone(originalExhibits), chapters = structuredClone(originalChapters);
  for (const id of objects) {
    for (const field of panelFields) {
      const key = `${id}.${field}`;
      if (values.has(key)) exhibits[id][field] = values.get(key);
    }
    periods.forEach((period, index) => {
      for (const field of chapterFields) {
        const key = `${id}.${period}.${field}`;
        if (values.has(key)) chapters[id][index][field] = values.get(key);
      }
    });
  }
  return { exhibits, chapters };
}

export async function loadPanelText(fetcher = fetch) {
  let response = await fetcher('/api/panel-text', { cache: 'no-store' });
  // A built dist/ folder can also be hosted by an ordinary static server.
  if (response.status === 404) response = await fetcher('/panel-text.txt', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Panel text unavailable (${response.status})`);
  return response.text();
}

export class PanelTextStore {
  constructor({ exhibits, chapters, onChange = () => {}, load = loadPanelText }) {
    this.originalExhibits = structuredClone(exhibits);
    this.originalChapters = structuredClone(chapters);
    this.exhibits = exhibits;
    this.chapters = chapters;
    this.onChange = onChange;
    this.load = load;
  }
  refresh() {
    if (this.pending) return this.pending;
    this.pending = this.load().then(text => {
      if (text === this.lastText) return false;
      // Parse completely before changing the visible content. Keep the last good
      // version if a file is being saved or a heading was accidentally changed.
      const content = applyPanelText(text, this.originalExhibits, this.originalChapters);
      Object.assign(this, content);
      this.lastText = text;
      this.onChange();
      return true;
    }).catch(error => {
      console.warn('Panel text: keeping the current version.', error.message);
      return false;
    }).finally(() => { this.pending = null; });
    return this.pending;
  }
}
