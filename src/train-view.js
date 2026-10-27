import { assetURL } from './assets.js';
import { sampleCityApproach } from './city-approach.js';
// The world moves independently of the physical carriage and window reflections.
export class TrainView {
  constructor({canvas,reducedMotion}){
    this.canvas=canvas;this.context=canvas.getContext('2d',{alpha:false});this.reducedMotion=reducedMotion;
    this.speed=.55;this.targetSpeed=.55;this.distance=0;this.phase='ready';
    this.cityElapsed=0;this.cityMix=0;
    this.cityCanvas=document.createElement('canvas');this.cityContext=this.cityCanvas.getContext('2d');
    this.image=new Image();this.image.src=assetURL('journey/countryside-panorama.png');
    this.image.decode().then(()=>{this.loaded=true;this.canvas.classList.add('loaded');this.resume();}).catch(()=>{});
    this.cityImage=new Image();this.cityImage.src=assetURL('journey/city-panorama.jpg');
    this.cityImage.decode().then(()=>{this.cityLoaded=true;if(this.loaded)this.paint();}).catch(()=>{});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();else if(this.phase!=='end')this.resume();});
    reducedMotion.addEventListener('change',()=>{this.pause();if(this.phase!=='end')this.resume();});
  }
  resize(){
    const bounds=this.canvas.getBoundingClientRect();this.width=bounds.width;this.height=bounds.height;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    this.canvas.width=Math.max(1,Math.round(this.width*ratio));this.canvas.height=Math.max(1,Math.round(this.height*ratio));
    this.cityCanvas.width=this.canvas.width;this.cityCanvas.height=this.canvas.height;
    this.cityContext.setTransform(ratio,0,0,ratio,0,0);
    this.context.setTransform(ratio,0,0,ratio,0,0);if(this.loaded)this.paint();
  }
  setPhase(phase){
    this.phase=phase;this.targetSpeed={ready:.55,riding:1,morphing:1,modern:.85,station:.18,exterior:.08,stopped:0,end:0}[phase]??0;
    if(phase==='ready'){this.cityElapsed=0;this.cityMix=0;this.distance=0;this.speed=.55;if(this.loaded)this.paint();}
    if(phase==='station'&&this.reducedMotion.matches)this.cityMix=1;
    if(phase==='end')this.pause();else this.resume();
  }
  resume(){
    if(!this.loaded||this.frame)return;this.last=0;
    if(this.reducedMotion.matches){this.paint();return;}
    this.frame=requestAnimationFrame(time=>this.tick(time));
  }
  pause(){cancelAnimationFrame(this.frame);this.frame=0;}
  tick(time){
    this.frame=0;if(!this.loaded||this.phase==='end')return;
    if(!this.last)this.last=time;
    if(time-this.last<30){this.frame=requestAnimationFrame(next=>this.tick(next));return;}
    const dt=Math.min(.06,(time-this.last)/1000);this.last=time;
    this.speed+=(this.targetSpeed-this.speed)*Math.min(1,dt*.85);
    if(this.phase==='station'||this.phase==='exterior'){
      this.cityElapsed+=dt;this.cityMix=sampleCityApproach(this.cityElapsed);
    }
    this.distance+=dt*this.speed*270;this.paint();
    this.frame=requestAnimationFrame(next=>this.tick(next));
  }
  tiled({image=this.image,context=this.context,sourceY=0,sourceHeight=image.naturalHeight,y=0,height=this.height,offset=0}){
    const ctx=context,tileWidth=height*image.naturalWidth/sourceHeight;
    const x=-((offset%tileWidth)+tileWidth)%tileWidth;
    for(let left=x;left<this.width;left+=tileWidth)ctx.drawImage(image,0,sourceY,image.naturalWidth,sourceHeight,left,y,tileWidth+1,height);
  }
  paintCity(){
    if(!this.cityLoaded||!this.cityMix)return;
    const ctx=this.cityContext,w=this.width,h=this.height,image=this.cityImage;
    ctx.clearRect(0,0,w,h);
    this.tiled({image,context:ctx,offset:this.distance*.48});
    this.tiled({image,context:ctx,sourceY:image.naturalHeight*.85,sourceHeight:image.naturalHeight*.15,y:h*.84,height:h*.16,offset:this.distance*1.65});
    // The city enters from the direction of travel. A broad feather blends the
    // skylines while both worlds keep scrolling; the window never holds a photo.
    const edge=w*(1.4-this.cityMix*2),feather=w*.34;
    const reveal=ctx.createLinearGradient(edge-feather,0,edge+feather,0);
    reveal.addColorStop(0,'#0000');reveal.addColorStop(1,'#000');
    ctx.globalCompositeOperation='destination-in';ctx.fillStyle=reveal;ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation='source-over';
    this.context.drawImage(this.cityCanvas,0,0,w,h);
  }
  paint(){
    if(!this.loaded||!this.width||!this.height)return;
    const ctx=this.context,h=this.height,w=this.width;
    ctx.fillStyle='#86918b';ctx.fillRect(0,0,w,h);
    this.tiled({offset:this.distance*.34});
    // Near grass moves faster than the distant tree line.
    this.tiled({sourceY:this.image.naturalHeight*.85,sourceHeight:this.image.naturalHeight*.15,y:h*.84,height:h*.16,offset:this.distance*1.5});
    this.paintCity();
    const poleGap=Math.max(620,w*.9),poleX=w-(this.distance*2.5)%poleGap;
    ctx.save();ctx.strokeStyle='#78827d';ctx.lineWidth=5;ctx.globalAlpha=.72;
    for(let x=poleX-poleGap;x<w+poleGap;x+=poleGap){
      ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x,h*.91);ctx.stroke();
      ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,h*.16);ctx.lineTo(x-80,h*.23);ctx.lineTo(x,h*.27);ctx.stroke();ctx.lineWidth=5;
    }
    ctx.globalAlpha=.34;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,h*.12);ctx.lineTo(w,h*.17);ctx.stroke();ctx.restore();
    const tint=ctx.createLinearGradient(0,0,0,h);tint.addColorStop(0,'#36565c18');tint.addColorStop(.75,'#102a2010');tint.addColorStop(1,'#111b2540');ctx.fillStyle=tint;ctx.fillRect(0,0,w,h);
  }
}
