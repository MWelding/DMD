import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {chapters,arrivalFrames} from '../src/chapters.js';
import {waitForBeat,Journey} from '../src/journey.js';
import {TrainView} from '../src/train-view.js';
import {cityApproachSeconds,sampleCityApproach} from '../src/city-approach.js';
test('all arrival frames and every vehicle chapter have local assets',async()=>{
  assert.equal(arrivalFrames.length,12);
  for(const path of arrivalFrames)await access(new URL(`../public${path}`,import.meta.url));
  await access(new URL('../public/assets/journey/forest-window.jpg',import.meta.url));
  for(const file of ['latvian-carriage.png','modern-carriage.png','countryside-panorama.png','city-panorama.jpg'])await access(new URL(`../public/assets/journey/${file}`,import.meta.url));
  for(const values of Object.values(chapters)){
    assert.deepEqual(values.map(value=>value.year),['1975','2000','2025']);
    for(const chapter of values){assert.ok(chapter.text&&chapter.title);await access(new URL(`../public/assets/${chapter.image}`,import.meta.url));}
  }
});

test('the city enters smoothly, resets on replay and has no static window overlay',async()=>{
  assert.equal(sampleCityApproach(-1),0);
  assert.equal(sampleCityApproach(cityApproachSeconds/2),.5);
  assert.equal(sampleCityApproach(cityApproachSeconds+1),1);
  assert.ok(sampleCityApproach(.1)<.01,'the reveal eases in');
  const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/class="station-photo"/);
  const view=Object.assign(Object.create(TrainView.prototype),{reducedMotion:{matches:true},cityElapsed:cityApproachSeconds,cityMix:1,distance:1200,loaded:false});
  view.setPhase('ready');
  assert.equal(view.cityMix,0);assert.equal(view.cityElapsed,0);assert.equal(view.distance,0);
  view.setPhase('station');
  assert.equal(view.cityMix,1,'reduced motion shows the city without a moving transition');
});

test('city buildings and foreground keep moving at different speeds during the reveal',()=>{
  const calls=[];
  const ctx={clearRect(){},drawImage(...args){calls.push(args);},createLinearGradient(){return {addColorStop(){}};},fillRect(){}};
  let composites=0;
  const image={naturalWidth:3000,naturalHeight:1000};
  const view=Object.assign(Object.create(TrainView.prototype),{cityLoaded:true,cityMix:.5,cityContext:ctx,cityCanvas:{},context:{drawImage(){composites++;}},cityImage:image,width:800,height:400,distance:120});
  view.paintCity();
  const first=calls.slice();calls.length=0;view.distance=200;view.paintCity();
  assert.ok(calls[0][5]<first[0][5],'building layer scrolls left');
  const near=first.findIndex(call=>call[2]>0);
  assert.ok(Math.abs(calls[near][5]-first[near][5])>Math.abs(calls[0][5]-first[0][5]),'near ground moves faster than buildings');
  assert.equal(ctx.globalCompositeOperation,'source-over');assert.equal(composites,2);
});
test('journey moves from the carriage to the station and then outside before stopping',async t=>{
  const previousImage=globalThis.Image;
  globalThis.Image=class{decode(){return Promise.resolve();}};
  t.after(()=>{globalThis.Image=previousImage;});
  const classes=new Set(),phases=[];
  const surface={dataset:{},classList:{add:(...values)=>values.forEach(value=>classes.add(value)),remove:(...values)=>values.forEach(value=>classes.delete(value))}};
  let completed=0,revealed=false;
  const announcements=[];
  const status={set textContent(value){announcements.push(value);}};
  const journey=new Journey({surface,button:{},status,back:{},front:{style:{}},reducedMotion:{matches:true},onPhase:phase=>phases.push(phase),onReveal:async({image,signal})=>{assert.equal(image,arrivalFrames.at(-1));assert.equal(signal.aborted,false);assert.equal(completed,0);revealed=true;},onFinish:()=>completed++});
  await journey.start();
  assert.deepEqual(phases,['riding','morphing','modern','station','exterior','stopped','end']);
  assert.equal(surface.dataset.phase,'complete');assert.equal(completed,1);
  assert.equal(revealed,true,'the photograph unfolds before interaction is handed to the collage');
  assert.equal(journey.back.src,arrivalFrames.at(-1));
  assert.equal(announcements.findIndex(value=>value.includes('Rīga')),announcements.length-1,'Riga is introduced only after the train stops');
  journey.reset();assert.equal(surface.dataset.phase,'ready');assert.equal(classes.size,0);
});
test('skipping a journey cancels pending beats instead of completing later',async()=>{
  const controller=new AbortController();const pending=waitForBeat(10000,controller.signal);controller.abort();
  await assert.rejects(pending,{name:'AbortError'});
  await assert.rejects(waitForBeat(10000,controller.signal),{name:'AbortError'});
});
