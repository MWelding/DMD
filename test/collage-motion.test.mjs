import test from 'node:test';
import assert from 'node:assert/strict';
import {clockAngles,CollageMotion,waveDefinitions} from '../src/collage-motion.js';

test('the clock uses Riga time in summer and winter, including fractional hand positions',()=>{
  const summer=clockAngles(new Date('2026-06-01T09:30:15.500Z'));
  assert.equal(summer.second,93);
  assert.ok(Math.abs(summer.minute-181.55)<1e-9);
  assert.ok(Math.abs(summer.hour-15.1291666667)<1e-8);
  assert.equal(clockAngles(new Date('2026-12-01T10:00:00Z')).hour,0);
});

test('photographic deformation shares one definition per object across the two colour layers',()=>{
  const markup=waveDefinitions();
  assert.equal((markup.match(/<filter /g)||[]).length,3);
  assert.equal((markup.match(/yChannelSelector="G"/g)||[]).length,3);
  assert.match(markup,/0 0 0 0 .5/,'vertical displacement stays neutral');
});

test('motion pauses for panels, hidden tabs and reduced motion, then resumes',()=>{
  const oldDocument=globalThis.document;
  globalThis.document={hidden:false};
  try{
    let paused=0,resumed=0;
    const controller=Object.assign(Object.create(CollageMotion.prototype),{
      active:true,panelOpen:false,reducedMotion:{matches:false},installation:{dataset:{}},
      scene:{style:{setProperty(){}},classList:{add(){},remove(){}},offsetWidth:1},
      definitions:{pauseAnimations(){paused++;},unpauseAnimations(){resumed++;}}
    });
    controller.sync();assert.equal(controller.installation.dataset.motion,'running');
    controller.setPanelOpen(true);assert.equal(controller.running,false);
    controller.setPanelOpen(false);assert.equal(controller.running,true);
    document.hidden=true;controller.sync();assert.equal(controller.running,false);
    document.hidden=false;controller.reducedMotion.matches=true;controller.sync();assert.equal(controller.running,false);
    controller.reducedMotion.matches=false;controller.sync();assert.equal(controller.running,true);
    controller.setActive(false);assert.equal(controller.running,false);
    assert.equal(resumed,3);assert.equal(paused,3);
  }finally{globalThis.document=oldDocument;}
});
