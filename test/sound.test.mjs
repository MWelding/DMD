import test from 'node:test';
import assert from 'node:assert/strict';
import {RailAmbience} from '../src/rail-audio.js';

test('the approach horn plays once after the cabin transforms and stays silent when muted',()=>{
  const audio=new RailAmbience(),parameter={setTargetAtTime(){}};
  Object.assign(audio,{context:{currentTime:0},roll:{playbackRate:parameter},rollFilter:{frequency:parameter},rollGain:{gain:parameter},airGain:{gain:parameter},motor:{frequency:parameter},motorGain:{gain:parameter}});
  let horns=0;audio.horn=()=>horns++;
  audio.phase('morphing');audio.phase('modern');
  assert.equal(horns,0,'muted journey phases never start a horn');
  audio.enabled=true;audio.hornPlayed=false;
  audio.phase('modern');audio.phase('modern');
  assert.equal(horns,1,'repeated phase updates do not repeat the horn');
  assert.equal(audio.modernCabin,true);
});

test('hover cues distinguish the three vehicles and throttle repeated or overlapping entries',()=>{
  const audio=new RailAmbience(),notes=[];
  audio.context={state:'running',currentTime:10};audio.enabled=true;
  audio.playfulNote=note=>notes.push(note);
  assert.equal(audio.hover('train'),true);
  assert.equal(notes.length,2);assert.ok(notes.every(note=>note.to>note.frequency));
  audio.context.currentTime=10.2;
  assert.equal(audio.hover('tram'),false,'rapid cross-object movement cannot layer effects');
  audio.context.currentTime=10.9;
  assert.equal(audio.hover('tram'),true);
  assert.equal(notes.length,8);assert.ok(notes.slice(2).every(note=>note.type==='sine'));
  audio.context.currentTime=11.1;
  assert.equal(audio.hover('train'),false);
  audio.context.currentTime=11.8;
  assert.equal(audio.hover('bus'),true);
  assert.equal(notes.length,10);assert.ok(notes.at(-1).to<notes.at(-1).frequency);
  audio.context.currentTime=12.8;audio.userMuted=true;
  assert.equal(audio.hover('train'),false);
  audio.userMuted=false;audio.journeyMode=true;
  assert.equal(audio.hover('train'),false);
  audio.journeyMode=false;audio.context.state='suspended';
  assert.equal(audio.hover('train'),false);
  audio.context.state='running';
  assert.equal(audio.hover('station'),false);
  assert.equal(notes.length,10,'muting, journeys and background tabs cannot start new cues');
});

test('the collage keeps effects available while stopping the journey bed and preserving mute',async()=>{
  const audio=new RailAmbience(),levels=[];
  audio.context={currentTime:10};audio.journeyMode=true;audio.enabled=true;
  const node={gain:{setValueAtTime:value=>levels.push(value),setTargetAtTime:value=>levels.push(value)}};
  for(const key of ['rollGain','airGain','motorGain','resonanceGain'])audio[key]=node;
  let enabled=0;audio.enable=async()=>enabled++;
  await audio.enterCollage();
  assert.equal(audio.journeyMode,false);assert.equal(audio.speed,0);
  assert.equal(enabled,1);assert.deepEqual(levels,[0,0,0,0]);
  audio.userMuted=true;await audio.enterCollage();
  assert.equal(enabled,1,'finishing or skipping the journey does not undo mute');
});

test('the entry horn has a stronger envelope without changing the rolling ambience',()=>{
  const audio=new RailAmbience(),peaks=[];
  const parameter={setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(value){peaks.push(value);}};
  const node=()=>({frequency:parameter,gain:parameter,pan:{},Q:{},connect(){},disconnect(){},start(){},stop(){}});
  audio.context={currentTime:0,createOscillator:node,createBiquadFilter:node,createGain:node,createStereoPanner:node};audio.master={};audio.enabled=true;
  audio.horn();
  assert.equal(peaks.length,3);assert.ok(peaks.every(value=>value>=.16&&value<=.2));
  audio.userMuted=true;audio.horn();assert.equal(peaks.length,3);
});
