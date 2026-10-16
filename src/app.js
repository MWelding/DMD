import { artwork } from './artwork.js';
import { eras, exhibits } from './content.js';
import { RailAmbience } from './audio.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const scene = $('#scene');
const past = $('#past-art');
const present = $('#present-art');
const installation = $('#installation');
const arrival = $('#arrival');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const visited = new Set();
const order = Object.keys(exhibits);
const ambience = new RailAmbience();
let era = 0, lens = true, returnFocus, arrivalTimers = [], frame = 0, pointer, toastTimer;
past.innerHTML = artwork();
present.innerHTML = artwork(true);

function showToast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
}
function setEra(index) {
  if (!eras[index]) return;
  era = index; scene.dataset.era = index;
  $('#era-label').textContent = eras[index].label;
  $('#era-name').textContent = eras[index].name;
  $$('.timeline button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.era) === index)));
  scene.classList.remove('scene-changing'); void scene.offsetWidth; scene.classList.add('scene-changing');
  if (index === 1) {
    present.innerHTML = artwork(true, true);
    // The transition is deliberately a visible overlap of old and contemporary forms.
  } else present.innerHTML = artwork(true);
}
$$('.timeline button').forEach(button => button.addEventListener('click', () => setEra(Number(button.dataset.era))));
$('.timeline').addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault(); setEra(event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (era + (event.key === 'ArrowRight' ? 1 : 2)) % 3);
  $$('.timeline button')[era].focus();
});
$('#lens-button').addEventListener('click', () => {
  lens = !lens; scene.classList.toggle('lens-off', !lens); $('#lens-button').setAttribute('aria-pressed', String(lens));
  showToast(lens ? 'Colour lens on. Move across the collage to reveal the present.' : 'Colour lens off. Choose an era to see the full composition.');
});
function updatePointer() {
  frame = 0; if (!pointer) return;
  const bounds = scene.getBoundingClientRect();
  const x = Math.max(0, Math.min(bounds.width, pointer.x - bounds.left));
  const y = Math.max(0, Math.min(bounds.height, pointer.y - bounds.top));
  scene.style.setProperty('--lx', `${x}px`); scene.style.setProperty('--ly', `${y}px`);
  if (!reducedMotion.matches && pointer.type !== 'touch') {
    scene.style.setProperty('--px', `${(x / bounds.width - .5) * -7}px`);
    scene.style.setProperty('--py', `${(y / bounds.height - .5) * -5}px`);
  }
}
scene.addEventListener('pointermove', event => {
  pointer = { x: event.clientX, y: event.clientY, type: event.pointerType };
  if (!frame) frame = requestAnimationFrame(updatePointer);
});
scene.addEventListener('pointerleave', () => {scene.style.setProperty('--px','0px');scene.style.setProperty('--py','0px');});

function openDialog(dialog, trigger) { returnFocus = trigger || document.activeElement; dialog.showModal(); }
function showStory(id, trigger) {
  const item = exhibits[id]; if (!item) return;
  visited.add(id);
  $('#visited-status').textContent = `${String(visited.size).padStart(2,'0')} / 04 STORIES DISCOVERED`;
  $$(`[data-object="${id}"]`).forEach(button => button.dataset.visited = 'true');
  const next = order[(order.indexOf(id) + 1) % order.length];
  $('#story-content').innerHTML = `<div class="story-topline">STORY ${item.number} / 04 &nbsp; — &nbsp; ${item.category}</div><div class="story-grid"><div class="story-visuals">${item.images.map((image,i) => `<figure><img src="/assets/${image}" alt="${item.names[i]}" width="400" height="240"><figcaption>${i === 0 ? 'THEN' : 'NOW'} / ${item.names[i]}</figcaption></figure>`).join('')}<span class="story-number">${item.number}</span></div><article class="story-text"><h2 id="story-title">${item.title}</h2><p class="story-intro">${item.intro}</p><h3>WHAT WE REMEMBER</h3><p>${item.past}</p><h3>WHAT COMES NEXT</h3><p>${item.present}</p><p class="story-question">${item.question}</p>${item.source ? `<a class="source-link" href="${item.source.url}" target="_blank" rel="noopener noreferrer">${item.source.title} ↗</a>` : ''}<p class="story-credit">${item.credit}</p><button class="story-next" data-next="${next}">Next story / ${exhibits[next].category.split(' / ')[0].toLowerCase()} <span>→</span></button></article></div>`;
  if (!$('#story-dialog').open) openDialog($('#story-dialog'), trigger);
  else $('#story-dialog').scrollTop = 0;
  $('.story-next').addEventListener('click', () => { showStory(next); $('.close-dialog').focus(); });
}
$$('.hotspot').forEach(button => {
  button.addEventListener('pointerenter', () => scene.dataset.hover = button.dataset.object);
  button.addEventListener('pointerleave', () => scene.dataset.hover = '');
  button.addEventListener('focus', () => {
    scene.dataset.hover = button.dataset.object;
    const r = button.getBoundingClientRect(); pointer = { x:r.left+r.width/2, y:r.top+r.height/2, type:'keyboard' }; updatePointer();
  });
  button.addEventListener('blur', () => scene.dataset.hover = '');
  // A deliberate drag reveals colour without accidentally opening a story on release.
  let start;
  button.addEventListener('pointerdown', e => start = { x:e.clientX, y:e.clientY });
  button.addEventListener('click', e => {
    if (e.detail && start && Math.hypot(e.clientX-start.x,e.clientY-start.y)>12) return;
    showStory(button.dataset.object, button);
  });
});
$$('dialog').forEach(dialog => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if(e.target === dialog) {const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();} });
  dialog.addEventListener('close', () => returnFocus?.focus());
});
$('#about-button').addEventListener('click', () => openDialog($('#about-dialog'), $('#about-button')));
$('#sound-button').addEventListener('click', async () => {
  try { const enabled = await ambience.toggle(); $('#sound-button').setAttribute('aria-pressed', String(enabled)); $('#sound-button').setAttribute('aria-label', enabled ? 'Disable ambient sound' : 'Enable ambient sound'); $('#sound-label').textContent = enabled ? 'Sound on' : 'Sound off'; }
  catch { showToast('Ambient audio is unavailable in this browser.'); }
});
$('#fullscreen-button').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { showToast('Use your browser’s full-screen option to expand the installation.'); }
});
document.addEventListener('fullscreenchange', () => $('#fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen' : 'Enter full screen'));
document.addEventListener('visibilitychange', () => ambience.visibility(document.hidden).catch(() => {}));

function clearArrivalTimers() { arrivalTimers.forEach(clearTimeout); arrivalTimers = []; }
function endArrival() {
  clearArrivalTimers(); arrival.classList.remove('riding','arriving'); arrival.classList.add('departed'); arrival.inert = true;
  installation.inert = false; $('#explore').focus({preventScroll:true});
  // Leave the final view in the chapter selected before replaying.
}
function startArrival() {
  if (arrival.classList.contains('riding')) return;
  if (reducedMotion.matches) return endArrival();
  arrival.classList.add('riding'); $('#begin-button').disabled = true;
  $('#begin-button').innerHTML = 'On our way <span>→</span>';
  $('#journey-status').textContent = 'PASSING THROUGH MEMORY';
  arrivalTimers.push(setTimeout(() => { arrival.classList.add('arriving'); $('#journey-status').textContent = 'ARRIVING / RĪGA CENTRĀLĀ'; $('#begin-button').innerHTML = 'Arriving <span>↗</span>'; }, 4700));
  arrivalTimers.push(setTimeout(endArrival, 7300));
}
function replayArrival() {
  clearArrivalTimers(); window.scrollTo({top:0,behavior:'instant'}); arrival.classList.remove('departed','riding','arriving');
  installation.inert = true; arrival.inert = false; $('#begin-button').disabled = false;
  $('#begin-button').innerHTML = 'Take a seat <span>→</span>'; $('#journey-status').textContent = 'YOUR JOURNEY STARTS HERE'; $('#begin-button').focus();
}
$('#begin-button').addEventListener('click', startArrival);
$('#skip-arrival').addEventListener('click', endArrival);
$('#replay-button').addEventListener('click', replayArrival);
$('.skip-link').addEventListener('click', endArrival);
// Hide the exhibition controls from keyboard and assistive technology during the journey.
installation.inert = true; $('#begin-button').focus({preventScroll:true});
reducedMotion.addEventListener('change', event => { if(event.matches && arrival.classList.contains('riding'))endArrival(); });
// Preload the paired photos, keeping every interaction available without a network connection.
Object.values(exhibits).flatMap(item => item.images).forEach(file => { const image = new Image(); image.src = `/assets/${file}`; });
