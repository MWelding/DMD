export function sampleRoute(value,count=3){
  const position=Math.max(0,Math.min(count-1,Number(value)||0));
  const left=Math.floor(position),right=Math.min(count-1,left+1),mix=position-left;
  return {position,left,right,mix,nearest:Math.round(position),progress:position/(count-1),opacity:Array.from({length:count},(_,index)=>index===0?1:Math.max(0,Math.min(1,position-index+1)))};
}
export function routeDescription(sample,chapters){
  if(Math.abs(sample.position-sample.nearest)<.025)return `${chapters[sample.nearest].year}: ${chapters[sample.nearest].title}`;
  return `Travelling between ${chapters[sample.left].year} and ${chapters[sample.right].year}, ${Math.round(sample.mix*100)} percent`;
}

export class TimeRoute {
  constructor({root,images,chapters,initial=0,reducedMotion,onChange}){
    Object.assign(this,{root,images,chapters,reducedMotion,onChange});this.range=root.querySelector('input');this.stops=[...root.querySelectorAll('[data-chapter]')];this.listeners=[];
    this.listen(this.range,'input',()=>{this.cancel();this.paint(Number(this.range.value));});
    this.listen(this.range,'keydown',event=>{
      const keys={ArrowLeft:-.05,ArrowRight:.05,ArrowDown:-.05,ArrowUp:.05,PageDown:-.5,PageUp:.5};
      if(event.key in keys){event.preventDefault();this.cancel();this.paint(this.position+keys[event.key]);}
    });
    this.stops.forEach(button=>this.listen(button,'click',()=>this.travel(Number(button.dataset.chapter))));
    const stopList=root.querySelector('[role=tablist]');
    this.listen(stopList,'keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?chapters.length-1:(Math.round(this.position)+(event.key==='ArrowRight'?1:chapters.length-1))%chapters.length;
      this.stops[next].focus();this.travel(next);
    });
    this.paint(initial);
  }
  listen(node,type,handler){node.addEventListener(type,handler);this.listeners.push(()=>node.removeEventListener(type,handler));}
  cancel(){cancelAnimationFrame(this.frame);this.frame=0;}
  travel(target){
    this.cancel();if(this.reducedMotion.matches)return this.paint(target);
    const start=this.position,duration=350+Math.abs(target-start)*300;let began;
    const step=time=>{began??=time;const t=Math.min(1,(time-began)/duration),ease=(1-Math.cos(t*Math.PI))/2;this.paint(start+(target-start)*ease);if(t<1)this.frame=requestAnimationFrame(step);else this.frame=0;};
    this.frame=requestAnimationFrame(step);
  }
  paint(value){
    const sample=sampleRoute(value,this.chapters.length);this.position=sample.position;this.range.value=sample.position;
    this.range.setAttribute('aria-valuetext',routeDescription(sample,this.chapters));
    this.root.style.setProperty('--route-progress',`${sample.progress*100}%`);
    this.root.querySelector('output').textContent=Math.abs(sample.position-sample.nearest)<.025?this.chapters[sample.nearest].year:`${this.chapters[sample.left].year} → ${this.chapters[sample.right].year}`;
    this.images.forEach((image,index)=>{image.style.opacity=sample.opacity[index];image.style.transform=`translateX(${(index-sample.position)*12}px) scale(1.06)`;});
    this.stops.forEach((button,index)=>{button.setAttribute('aria-selected',String(index===sample.nearest));button.tabIndex=index===sample.nearest?0:-1;});
    this.onChange(sample);
  }
  destroy(){this.cancel();this.listeners.forEach(remove=>remove());}
}
