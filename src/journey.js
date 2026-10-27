import { arrivalFrames } from './chapters.js';
import { assetURL } from './assets.js';

export function waitForBeat(ms, signal) {
  return new Promise((resolve,reject)=>{
    if(signal.aborted)return reject(new DOMException('Journey cancelled','AbortError'));
    const done=()=>{signal.removeEventListener('abort',cancel);resolve();};
    const timer=setTimeout(done,ms);
    const cancel=()=>{clearTimeout(timer);signal.removeEventListener('abort',cancel);reject(new DOMException('Journey cancelled','AbortError'));};
    signal.addEventListener('abort',cancel,{once:true});
  });
}

export class Journey {
  constructor({surface,button,status,back,front,onFinish,onPhase=()=>{},onReveal=async()=>{},reducedMotion}) {
    Object.assign(this,{surface,button,status,back,front,onFinish,onPhase,onReveal,reducedMotion});
    this.ready=this.preload();
  }
  async preload() {
    const sources=[...['journey/forest-window.jpg','journey/window.jpg','journey/modern-carriage.png'].map(assetURL),...arrivalFrames];
    const results=await Promise.all(sources.map(async path=>{
      const image=new Image(); image.src=path;
      try {await image.decode();return path;}catch{return null;}
    }));
    this.modernReady=Boolean(results[2]);
    this.frames=results.slice(3).filter(Boolean);
    if(this.frames.length)this.back.src=this.frames[0];
  }
  async start() {
    if(this.playing)return;
    this.controller=new AbortController();const {signal}=this.controller;
    this.playing=true;this.button.disabled=true;
    this.status.textContent='Travelling through the countryside.';
    try {
      await this.ready;
      if(signal.aborted)return;
      this.surface.classList.add('riding');
      this.surface.dataset.phase='riding';this.onPhase('riding');
      await waitForBeat(this.reducedMotion.matches?250:4200,signal);
      if(this.modernReady){
        this.surface.classList.add('morphing');this.surface.dataset.phase='morphing';this.onPhase('morphing');
        this.status.textContent='The carriage transforms around you.';
        await waitForBeat(this.reducedMotion.matches?100:4300,signal);
        this.surface.classList.add('modern');this.surface.dataset.phase='modern';this.onPhase('modern');
        await waitForBeat(this.reducedMotion.matches?150:2400,signal);
      }
      this.surface.classList.add('station');this.surface.dataset.phase='station';this.onPhase('station');
      this.status.textContent='Arriving at the station, viewed from inside the train.';
      await waitForBeat(this.reducedMotion.matches?500:3700,signal);
      this.surface.classList.add('exterior');this.surface.dataset.phase='exterior';this.onPhase('exterior');
      this.status.textContent='The train arrives, viewed from the platform.';
      const frames=this.reducedMotion.matches?this.frames.slice(-1):this.frames;
      this.front.style.opacity='0';
      if(frames.length)this.back.src=frames[0];
      for(let i=1;i<frames.length;i++) {
        // The intervals lengthen as the train slows; the final photograph holds still.
        await waitForBeat(270+i*12,signal);
        if(i%2){this.front.src=frames[i];this.front.style.opacity='1';}
        else {this.back.src=frames[i];this.front.style.opacity='0';}
      }
      await waitForBeat(this.reducedMotion.matches?150:350,signal);
      this.surface.classList.add('stopped');this.surface.dataset.phase='stopped';this.onPhase('stopped');
      this.status.textContent='Rīga. The train has stopped.';
      await waitForBeat(this.reducedMotion.matches?600:2700,signal);
      this.surface.dataset.phase='unfolding';
      await this.onReveal({image:frames.at(-1)??assetURL('journey/arrival-11.jpg'),signal});
      if(signal.aborted)return;
      this.finish();
    }catch(error){if(error.name!=='AbortError'){this.finish();console.warn('The journey could not play.',error);}}
  }
  finish() {
    this.controller?.abort();this.playing=false;
    this.surface.classList.add('departed');this.surface.inert=true;
    this.surface.dataset.phase='complete';this.onPhase('end');
    this.onFinish();
  }
  reset() {
    this.controller?.abort();this.playing=false;
    this.surface.classList.add('resetting');
    this.surface.classList.remove('departed','riding','morphing','modern','station','exterior','stopped','arriving','arrived','unfolding');this.surface.inert=false;this.surface.dataset.phase='ready';
    this.front.style.opacity='0';if(this.frames?.length)this.back.src=this.frames[0];
    this.button.disabled=false;this.button.innerHTML='Begin journey <span>→</span>';
    this.status.textContent='';
    // Commit the first shot before restoring transitions, avoiding old frame ghosts on replay.
    void this.surface.offsetWidth;
    this.surface.classList.remove('resetting');
  }
}
