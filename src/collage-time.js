import {sampleRoute} from './time-route.js';

export const collageStops=['Past','In transit','Present'];
export function collageState(value){
  const sample=sampleRoute(value);
  return {...sample,weights:[Math.max(0,1-sample.position),1-Math.abs(sample.position-1),Math.max(0,sample.position-1)],label:Math.abs(sample.position-sample.nearest)<.025?collageStops[sample.nearest]:`${collageStops[sample.left]} → ${collageStops[sample.right]}`};
}

// A single position drives both the monochrome scene and the colour lens.
export class CollageTime {
  constructor({scene,root,reducedMotion}){
    Object.assign(this,{scene,root,reducedMotion});this.input=root.querySelector('input');this.buttons=[...root.querySelectorAll('[data-era]')];
    this.input.addEventListener('input',()=>{this.cancel();this.paint(this.input.value);});
    this.input.addEventListener('keydown',event=>{
      if(!['PageUp','PageDown'].includes(event.key))return;
      event.preventDefault();this.cancel();this.paint(this.position+(event.key==='PageUp'?.25:-.25));
    });
    this.buttons.forEach(button=>button.addEventListener('click',()=>this.travel(Number(button.dataset.era))));
    this.paint(1);
  }
  cancel(){cancelAnimationFrame(this.frame);}
  paint(value){
    const sample=collageState(value);this.position=sample.position;this.input.value=sample.position;
    this.input.setAttribute('aria-valuetext',sample.label);
    this.root.style.setProperty('--time-progress',`${sample.progress*100}%`);
    this.scene.style.setProperty('--era-past',sample.weights[0]);
    this.scene.style.setProperty('--era-middle',sample.weights[1]);
    this.scene.style.setProperty('--era-present',sample.weights[2]);
    this.scene.dataset.era=collageStops[sample.nearest];
    this.buttons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===sample.nearest)));
  }
  travel(target){
    this.cancel();if(this.reducedMotion.matches)return this.paint(target);
    const start=this.position,duration=650+Math.abs(target-start)*250;let began;
    const step=time=>{began??=time;const t=Math.min(1,(time-began)/duration);this.paint(start+(target-start)*(1-Math.cos(Math.PI*t))/2);if(t<1)this.frame=requestAnimationFrame(step);};
    this.frame=requestAnimationFrame(step);
  }
}
