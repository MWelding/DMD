import { artwork } from './artwork.js';
import { exhibits } from './content.js';
import { chapters } from './chapters.js';
import { RailAmbience } from './rail-audio.js';
import { Journey } from './journey.js';
import { TrainView } from './train-view.js';
import { TimeRoute } from './time-route.js';
import { FragmentTransition } from './fragments.js';
import { CollageMotion } from './collage-motion.js';
import { PanelTextStore } from './panel-text.js';
import { assetURL } from './assets.js';
import { initOfflineEditor, applyOfflineImages } from './offline-editor.js';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const scene=$('#scene'),installation=$('#installation');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const trainView=new TrainView({canvas:$('#landscape'),reducedMotion});
const fragmentTransition=new FragmentTransition({arrival:$('#arrival'),installation,scene,reducedMotion});
const ambience=new RailAmbience(),visited=new Set(),chapterPositions=new Map();
let frame=0,pointer,returnFocus,currentStory,storyRevision=0,toastTimer,activeRoute;
const offlineSession=globalThis.__OFFLINE_SESSION__;
const panelText=new PanelTextStore({exhibits,chapters,onChange:refreshOpenStory,
  load:offlineSession?async()=>offlineSession.text:undefined,
  transform:offlineSession?content=>applyOfflineImages(content,offlineSession.cardImages):undefined});
const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
$('#past-art').innerHTML=artwork();$('#present-art').innerHTML=artwork(true);
const collageMotion=new CollageMotion({installation,scene,reducedMotion});
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}

// One animation frame per pointer update. All photographic pieces share its coordinates.
function paintPointer(){
  frame=0;if(!pointer)return;
  const {x,y,type}=pointer;
  const cursor=$('#cursor');cursor.style.left=`${x}px`;cursor.style.top=`${y}px`;
  if(!reducedMotion.matches){$('#arrival').style.setProperty('--head-x',`${(x/innerWidth-.5)*-7}px`);$('#arrival').style.setProperty('--head-y',`${(y/innerHeight-.5)*-4}px`);}
  cursor.style.opacity=type==='mouse'&&!reducedMotion.matches?'1':'0';
  const rect=scene.getBoundingClientRect();
  const localX=Math.min(rect.width,Math.max(0,x-rect.left)),localY=Math.min(rect.height,Math.max(0,y-rect.top));
  scene.style.setProperty('--lx',`${localX}px`);scene.style.setProperty('--ly',`${localY}px`);
  if(!reducedMotion.matches&&type==='mouse'){
    scene.style.setProperty('--px',`${(localX/rect.width-.5)*-9}px`);
    scene.style.setProperty('--py',`${(localY/rect.height-.5)*-6}px`);
    scene.style.setProperty('--mouse-x',`${(localX/rect.width-.5)*18}px`);
    scene.style.setProperty('--mouse-y',`${(localY/rect.height-.5)*12}px`);
    scene.style.setProperty('--camera-x',`${(localY/rect.height-.5)*-3}deg`);
    scene.style.setProperty('--camera-y',`${(localX/rect.width-.5)*4}deg`);
  }
}
document.addEventListener('pointermove',event=>{pointer={x:event.clientX,y:event.clientY,type:event.pointerType};if(!frame)frame=requestAnimationFrame(paintPointer);});
document.addEventListener('pointerout',event=>{if(!event.relatedTarget)$('#cursor').style.opacity='0';});
document.addEventListener('pointerover',event=>$('#cursor').classList.toggle('active',Boolean(event.target.closest('button,a,summary'))));


function openDialog(dialog,trigger){returnFocus=trigger||document.activeElement;collageMotion.setPanelOpen(true);dialog.showModal();}
function refreshOpenStory(){
  if(!$('#story-dialog').open||!currentStory||!activeRoute)return;
  const item=panelText.exhibits[currentStory],stops=panelText.chapters[currentStory];
  $('.story-category').textContent=item.category;
  $('#story-title').textContent=item.title;
  $('.story-intro').textContent=item.intro;
  $$('.route-image').forEach((image,index)=>{image.alt=stops[index].caption;const src=assetURL(stops[index].image);if(image.getAttribute('src')!==src)image.src=src;});
  $$('.route-stops [data-chapter]').forEach((button,index)=>button.lastChild.textContent=stops[index].year);
  activeRoute.chapters=stops;
  activeRoute.paint(activeRoute.position);
}
function showStory(id,trigger){
  const item=panelText.exhibits[id];if(!item)return;
  panelText.refresh();
  activeRoute?.destroy();currentStory=id;visited.add(id);
  $$(`[data-object="${id}"]`).forEach(button=>button.dataset.visited='true');
  const stops=panelText.chapters[id];$('#story-dialog').dataset.object=id;
  $('#story-content').innerHTML=`<div class="story-layout"><div class="story-visual route-visual">${stops.map((chapter,index)=>`<img class="story-image route-image" src="${assetURL(chapter.image)}" alt="${escapeText(chapter.caption)}" data-past="${index===0}" style="opacity:${index===0?1:0}">`).join('')}<div class="story-image-caption"></div></div><article class="story-text"><p class="story-category">${escapeText(item.category)}</p><h2 id="story-title">${escapeText(item.title)}</h2><p class="story-intro">${escapeText(item.intro)}</p>${offlineSession?'<button type="button" class="offline-card-edit" id="edit-story-copy">Edit this card</button>':''}<div class="time-route"><div class="route-track"><span class="route-rail"></span><span class="route-distance"></span><span class="route-carriage" aria-hidden="true">▥</span><input class="time-range" type="range" min="0" max="2" step="0.01" value="0" aria-label="Journey through ${id} history" aria-controls="chapter-panel"></div><div class="route-stops story-era-tabs" role="tablist" aria-label="${id} journey stops">${stops.map((chapter,index)=>`<button role="tab" id="era-tab-${index}" aria-controls="chapter-panel" aria-selected="${index===0}" tabindex="${index===0?0:-1}" data-chapter="${index}"><span class="route-station" aria-hidden="true"></span>${escapeText(chapter.year)}</button>`).join('')}</div><output class="route-position" aria-hidden="true"></output></div><div id="chapter-panel" role="tabpanel" tabindex="0" aria-live="polite"></div></article></div>`;
  if(offlineSession)$('#edit-story-copy').addEventListener('click',()=>offlineSession.openEditor(id));
  let renderedChapter;
  activeRoute=new TimeRoute({root:$('.time-route'),images:$$('.route-image'),chapters:stops,initial:chapterPositions.get(id)??0,reducedMotion,onChange:sample=>{
    chapterPositions.set(id,sample.position);
    const chapter=panelText.chapters[id][sample.nearest];
    if(renderedChapter!==chapter){
      renderedChapter=chapter;
      $('#chapter-panel').setAttribute('aria-labelledby',`era-tab-${sample.nearest}`);
      $('#chapter-panel').innerHTML=`<h3 class="chapter-title">${escapeText(chapter.title)}</h3><p class="chapter-copy">${escapeText(chapter.text)}</p>`;
      $('.story-image-caption').innerHTML=`<span>${escapeText(chapter.label)}</span>${escapeText(chapter.caption)}`;
    }
  }});
  if(!$('#story-dialog').open)openDialog($('#story-dialog'),trigger);else{$('#story-dialog').scrollTop=0;$('#story-dialog .close-dialog').focus();}

}
$$('[data-object]').forEach(button=>{
  const id=button.dataset.object;
  button.addEventListener('pointerenter',event=>{
    scene.dataset.hover=id;
    if(event.pointerType!=='touch'&&button.matches('.train-hit,.tram-hit,.bus-hit')&&!installation.inert&&!$('dialog[open]'))ambience.hover(id);
  });
  button.addEventListener('pointerleave',()=>scene.dataset.hover='');
  button.addEventListener('focus',()=>{scene.dataset.hover=id;if(button.classList.contains('hotspot')){const r=button.getBoundingClientRect();pointer={x:r.left+r.width/2,y:r.top+r.height/2,type:'keyboard'};paintPointer();}});
  button.addEventListener('blur',()=>scene.dataset.hover='');
  let start;button.addEventListener('pointerdown',e=>start={x:e.clientX,y:e.clientY});
  button.addEventListener('click',e=>{if(e.detail&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>12)return;showStory(id,button);});
});
$$('dialog').forEach(dialog=>{
  dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{collageMotion.setPanelOpen(false);storyRevision++;if(dialog.id==='story-dialog'){activeRoute?.destroy();activeRoute=null;}returnFocus?.focus();});
});
$('#about-button').addEventListener('click',()=>openDialog($('#about-dialog'),$('#about-button')));
function updateSoundControls(){
  const armed=!ambience.userMuted&&!ambience.journeyMode&&!$('#arrival').classList.contains('departed');
  for(const [id,active] of [['sound-button',ambience.enabled],['journey-sound',ambience.enabled||armed]]){
    const button=$('#'+id);button.setAttribute('aria-pressed',String(active));
    button.dataset.state=ambience.enabled?'playing':active?'armed':'muted';
    button.setAttribute('aria-label',active?'Mute sound':'Enable sound');
    button.title=ambience.enabled?'Sound on':active?'Train sound enabled':'Sound muted';
  }
}
ambience.onState=updateSoundControls;updateSoundControls();
$('#sound-button').addEventListener('click',()=>ambience.toggle().catch(()=>toast('Audio is unavailable in this browser.')));
$('#journey-sound').addEventListener('click',()=>ambience.muteJourney(!ambience.userMuted).catch(()=>toast('Audio is unavailable in this browser.')));
$('#fullscreen-button').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Use your browser’s full-screen option.');}});
document.addEventListener('fullscreenchange',()=>$('#fullscreen-button').setAttribute('aria-label',document.fullscreenElement?'Exit full screen':'Enter full screen'));
document.addEventListener('visibilitychange',()=>ambience.visibility(document.hidden).catch(()=>{}));

const journey=new Journey({surface:$('#arrival'),button:$('#begin-button'),status:$('#journey-status'),back:$('#film-back'),front:$('#film-front'),reducedMotion,onPhase:phase=>{ambience.phase(phase);trainView.setPhase(phase);},onReveal:options=>fragmentTransition.play(options),onFinish:()=>{installation.inert=false;collageMotion.setActive(true);ambience.enterCollage().catch(()=>{});updateSoundControls();$('#explore').focus({preventScroll:true});}});
$('#begin-button').addEventListener('click',()=>{ambience.startJourney().catch(()=>{});journey.start();});
$('#skip-arrival').addEventListener('click',()=>journey.finish());
$('.skip-link').addEventListener('click',()=>journey.finish());
$('#replay-button').addEventListener('click',()=>{window.scrollTo({top:0,behavior:'instant'});installation.inert=true;collageMotion.setActive(false);journey.reset();trainView.setPhase('ready');updateSoundControls();$('#begin-button').focus({preventScroll:true});});
reducedMotion.addEventListener('change',event=>{if(event.matches&&journey.playing)journey.finish();});
$('#begin-button').focus({preventScroll:true});
// Local, decoded assets keep the chapter changes immediate, without external services.
new Set(Object.values(chapters).flatMap(values=>values.map(chapter=>chapter.image))).forEach(file=>{const image=new Image();image.src=assetURL(file);});

// The offline editor applies in-memory changes; the normal site watches its text file.
panelText.refresh();
if(offlineSession){
  initOfflineEditor({session:offlineSession,store:panelText,onPreview:id=>showStory(id),onPanelChange:open=>collageMotion.setPanelOpen(open)});
}else{
  setInterval(()=>{if(!document.hidden)panelText.refresh();},2000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)panelText.refresh();});
}
