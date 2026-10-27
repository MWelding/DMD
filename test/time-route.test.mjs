import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleRoute,routeDescription} from '../src/time-route.js';
import {fragmentShapes} from '../src/fragments.js';
import {artwork} from '../src/artwork.js';
test('scrubbing traverses and reverses all three photographic layers continuously',()=>{
  assert.deepEqual(sampleRoute(-10).opacity,[1,0,0]);
  assert.deepEqual(sampleRoute(.4).opacity,[1,.4,0]);
  assert.deepEqual(sampleRoute(1.75).opacity,[1,1,.75]);
  assert.equal(sampleRoute(10).position,2);
  const stops=[{year:'1975',title:'Memory'},{year:'2000',title:'Transition'},{year:'2025',title:'Present'}];
  assert.equal(routeDescription(sampleRoute(.4),stops),'Travelling between 1975 and 2000, 40 percent');
  assert.equal(routeDescription(sampleRoute(2),stops),'2025: Present');
});
test('the breakup starts with a complete partition of the photograph',()=>{
  const area=points=>Math.abs(points.reduce((sum,p,i)=>{const next=points[(i+1)%points.length];return sum+p[0]*next[1]-next[0]*p[1];},0))/2;
  assert.equal(fragmentShapes.length,12);
  assert.ok(Math.abs(fragmentShapes.reduce((sum,shape)=>sum+area(shape.points),0)-1)<1e-10);
  const html=artwork()+artwork(true);
  for(const shape of fragmentShapes)assert.ok(html.includes(`data-reveal="${shape.target}"`));
  const ids=[...html.matchAll(/clipPath id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'reused photographs must have independent SVG masks');
});
