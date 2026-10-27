import { parsePanelText, serializePanelText } from './panel-text.js';
import { assetURL } from './assets.js';

const objects = ['train', 'tram', 'bus', 'station'];
const periods = ['past', 'transition', 'present'];
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function applyOfflineImages(content, images = {}) {
  for (const [key, image] of Object.entries(images)) {
    const [id, index] = key.split('.');
    if (objects.includes(id) && /^[012]$/.test(index) && /^data:image\/(?:jpeg|png|webp|gif);base64,/.test(image)) {
      content.chapters[id][Number(index)].image = image;
    }
  }
  return content;
}

export function offlinePageWithState(template, state) {
  const json = JSON.stringify({ version: 1, text: state.text, cardImages: state.cardImages || {} }).replace(/</g, '\\u003c');
  const marker = /(<script id="offline-state" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (!marker.test(template)) throw new Error('The offline document template is missing.');
  return template.replace(marker, (_, before, after) => before + json + after);
}

export function initOfflineEditor({ session, store, onPreview, onPanelChange }) {
  const launcher = document.createElement('button');
  launcher.className = 'offline-launcher';
  launcher.textContent = 'Edit content';
  launcher.title = 'Edit offline content (Ctrl+Shift+E)';
  document.body.append(launcher);
  const dialog = document.createElement('dialog');
  dialog.className = 'offline-editor';
  dialog.setAttribute('aria-labelledby', 'offline-editor-title');
  dialog.innerHTML = `<header class="offline-editor-head"><div><p>OFFLINE EDITION</p><h2 id="offline-editor-title">Edit content</h2></div><button type="button" class="offline-close" aria-label="Close editor">×</button></header>
    <p class="offline-help">Apply to preview your edits. Download an updated HTML to keep them when you close the browser.</p>
    <div class="offline-editor-tools"><label>Card <select id="offline-object">${objects.map(id => `<option value="${id}">${id[0].toUpperCase() + id.slice(1)}</option>`).join('')}</select></label>
    <button type="button" id="offline-import">Import texts</button><button type="button" id="offline-export-text">Export texts</button><input type="file" id="offline-text-file" accept=".txt,text/plain" hidden></div>
    <form id="offline-fields"></form><footer class="offline-editor-foot"><span id="offline-status" role="status">Edits are stored in the HTML you download.</span><div><button type="button" id="offline-apply">Apply changes</button><button type="button" id="offline-preview">Preview card</button><button type="button" id="offline-save" class="offline-primary">Download updated HTML</button></div></footer>`;
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  const form = find('#offline-fields'), select = find('#offline-object');
  let selected = 'train', draftValues, draftImages, returnFocus, dirty = false;
  const status = message => { find('#offline-status').textContent = message; };
  const collect = () => form.querySelectorAll('[data-text-key]').forEach(input => draftValues.set(input.dataset.textKey, input.value));
  const valueFor = key => {
    if (draftValues.has(key)) return draftValues.get(key);
    const [id, part, field] = key.split('.');
    return field ? store.originalChapters[id][periods.indexOf(part)][field] : store.originalExhibits[id][part];
  };
  function field(parent, key, label, rows = 1) {
    const wrapper = document.createElement('label');
    wrapper.className = 'offline-field';
    const title = document.createElement('span'); title.textContent = label;
    const input = document.createElement(rows > 1 ? 'textarea' : 'input');
    if (rows > 1) input.rows = rows; else input.type = 'text';
    input.dataset.textKey = key;
    input.value = valueFor(key) ?? '';
    input.addEventListener('input', () => { dirty = true; status('Unapplied edits. Apply to preview, or download an updated HTML.'); });
    wrapper.append(title, input); parent.append(wrapper);
  }
  function render() {
    form.replaceChildren();
    const main = document.createElement('fieldset');
    const legend = document.createElement('legend'); legend.textContent = 'Main card'; main.append(legend);
    field(main, `${selected}.category`, 'Category');
    field(main, `${selected}.title`, 'Title');
    field(main, `${selected}.intro`, 'Introduction', 3);
    form.append(main);
    periods.forEach((period, index) => {
      const section = document.createElement('fieldset');
      const heading = document.createElement('legend'); heading.textContent = period[0].toUpperCase() + period.slice(1); section.append(heading);
      field(section, `${selected}.${period}.year`, 'Date / slider label');
      field(section, `${selected}.${period}.title`, 'Chapter title');
      field(section, `${selected}.${period}.label`, 'Small era label');
      field(section, `${selected}.${period}.caption`, 'Photo caption', 2);
      field(section, `${selected}.${period}.text`, 'Description', 5);
      const imageKey = `${selected}.${index}`;
      const photo = document.createElement('div'); photo.className = 'offline-photo';
      const preview = document.createElement('img'); preview.alt = `${period} card photo`;
      preview.src = draftImages[imageKey] || assetURL(store.originalChapters[selected][index].image);
      const actions = document.createElement('div');
      const label = document.createElement('label'); label.className = 'offline-file-label'; label.textContent = 'Replace card photo';
      const picker = document.createElement('input'); picker.type = 'file'; picker.accept = [...imageTypes].join(',');
      picker.setAttribute('aria-label', `Replace ${period} card photo`);
      picker.addEventListener('change', async () => {
        const file = picker.files[0]; if (!file) return;
        try {
          if (!imageTypes.has(file.type)) throw new Error('Choose a JPEG, PNG, WebP or GIF image.');
          const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Image could not be read.')); reader.readAsDataURL(file); });
          const probe = new Image(); probe.src = data; await probe.decode();
          draftImages[imageKey] = data; preview.src = data; dirty = true;
          status('Photo selected. Apply changes or download an updated HTML.');
        } catch (error) { status(error.message); }
        picker.value = '';
      });
      label.append(picker);
      const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Use original photo';
      reset.addEventListener('click', () => { delete draftImages[imageKey]; preview.src = assetURL(store.originalChapters[selected][index].image); dirty = true; });
      actions.append(label, reset); photo.append(preview, actions); section.append(photo); form.append(section);
    });
  }
  async function apply() {
    collect();
    const text = serializePanelText(draftValues); parsePanelText(text);
    session.text = text; session.cardImages = structuredClone(draftImages);
    if (store.pending) await store.pending;
    if (!await store.refresh(true)) throw new Error('Changes could not be applied.');
    status('Applied for this session. Download an updated HTML to keep your changes.');
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function open(id = 'train') {
    if (dialog.open) return;
    // Preserve an unapplied draft when closing and reopening the editor.
    if (!draftValues) { draftValues = parsePanelText(session.text); draftImages = structuredClone(session.cardImages || {}); }
    selected = objects.includes(id) ? id : 'train'; select.value = selected;
    returnFocus = document.activeElement; render(); dialog.showModal(); onPanelChange(true);
  }
  session.openEditor = open;
  launcher.addEventListener('click', () => open());
  select.addEventListener('change', () => { collect(); selected = select.value; render(); });
  form.addEventListener('submit', event => event.preventDefault());
  find('.offline-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { collect(); onPanelChange(Boolean(document.querySelector('dialog[open]'))); returnFocus?.focus(); });
  find('#offline-apply').addEventListener('click', () => apply().catch(error => status(error.message)));
  find('#offline-preview').addEventListener('click', async () => { try { await apply(); dialog.close(); onPreview(selected); } catch (error) { status(error.message); } });
  find('#offline-save').addEventListener('click', async () => {
    try {
      await apply();
      download(new Blob([offlinePageWithState(session.template, session)], { type: 'text/html;charset=utf-8' }), 'Change-in-Progress-Offline.html');
      dirty = false; status('Updated HTML download started. Open that downloaded copy next time.');
    } catch (error) { status(error.message); }
  });
  find('#offline-export-text').addEventListener('click', async () => {
    try { await apply(); download(new Blob([session.text], { type: 'text/plain;charset=utf-8' }), 'PANEL-TEXT.txt'); status('Text download started. Photo replacements are saved through Download updated HTML.'); }
    catch (error) { status(error.message); }
  });
  const textFile = find('#offline-text-file');
  find('#offline-import').addEventListener('click', () => textFile.click());
  textFile.addEventListener('change', async () => {
    const file = textFile.files[0]; if (!file) return;
    try { const values = parsePanelText(await file.text()); draftValues = values; dirty = true; render(); await apply(); status('Text file imported and applied. Download an updated HTML to keep it.'); }
    catch (error) { status(`Text file not imported: ${error.message}`); }
    textFile.value = '';
  });
  document.addEventListener('keydown', event => { if (event.ctrlKey && event.shiftKey && event.code === 'KeyE') { event.preventDefault(); open(); } });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
}
