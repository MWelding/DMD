// The world moves independently of the physical carriage and window reflections.
export class TrainView {
  constructor({canvas,reducedMotion}){
    this.canvas=canvas;this.context=canvas.getContext('2d',{alpha:false});this.reducedMotion=reducedMotion;
    this.speed=.55;this.targetSpeed=.55;this.distance=0;this.phase='ready';
    this.image=new Image();this.image.src='/assets/journey/countryside-panorama.png';
    this.image.decode().then(()=>{this.loaded=true;this.canvas.classList.add('loaded');this.resume();}).catch(()=>{});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();else if(this.phase!=='end')this.resume();});
    reducedMotion.addEventListener('change',()=>{this.pause();if(this.phase!=='end')this.resume();});
  }
  resize(){
    const bounds=this.canvas.getBoundingClientRect();this.width=bounds.width;this.height=bounds.height;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    this.canvas.width=Math.max(1,Math.round(this.width*ratio));this.canvas.height=Math.max(1,Math.round(this.height*ratio));
    this.context.setTransform(ratio,0,0,ratio,0,0);if(this.loaded)this.paint();
  }
  setPhase(phase){
    this.phase=phase;this.targetSpeed={ready:.55,riding:1,morphing:1,modern:.85,station:.18,exterior:.08,stopped:0,end:0}[phase]??0;
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
    this.distance+=dt*this.speed*270;this.paint();
    this.frame=requestAnimationFrame(next=>this.tick(next));
  }
  tiled({sourceY=0,sourceHeight=this.image.naturalHeight,y=0,height=this.height,offset=0}){
    const image=this.image,ctx=this.context,tileWidth=height*image.naturalWidth/sourceHeight;
    const x=-((offset%tileWidth)+tileWidth)%tileWidth;
    for(let left=x;left<this.width;left+=tileWidth)ctx.drawImage(image,0,sourceY,image.naturalWidth,sourceHeight,left,y,tileWidth+1,height);
  }
  paint(){
    if(!this.loaded||!this.width||!this.height)return;
    const ctx=this.context,h=this.height,w=this.width;
    ctx.fillStyle='#86918b';ctx.fillRect(0,0,w,h);
    this.tiled({offset:this.distance*.34});
    // Near grass moves faster than the distant tree line.
    this.tiled({sourceY:this.image.naturalHeight*.85,sourceHeight:this.image.naturalHeight*.15,y:h*.84,height:h*.16,offset:this.distance*1.5});
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
