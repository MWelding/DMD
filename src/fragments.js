// Irregular shared edges keep the photograph complete until its layers separate.
const lattice=[
  [[0,0],[.23,0],[.52,0],[.78,0],[1,0]],
  [[0,.31],[.29,.4],[.55,.33],[.74,.4],[1,.32]],
  [[0,.69],[.24,.65],[.55,.74],[.8,.67],[1,.72]],
  [[0,1],[.25,1],[.5,1],[.77,1],[1,1]]
];
const targets=['board','clock','canopy','station','train','train','passenger','tram','ticket','platform','signal','bus'];
export const fragmentShapes=Array.from({length:12},(_,index)=>{
  const row=Math.floor(index/4),column=index%4,points=[lattice[row][column],lattice[row][column+1],lattice[row+1][column+1],lattice[row+1][column]];
  return {points,target:targets[index],center:points.reduce((sum,p)=>[sum[0]+p[0]/4,sum[1]+p[1]/4],[0,0])};
});

export class FragmentTransition {
  constructor({arrival,installation,scene,reducedMotion}){Object.assign(this,{arrival,installation,scene,reducedMotion});}
  async play({image,signal}){
    if(signal.aborted||this.reducedMotion.matches)return;
    const overlay=document.createElement('div');overlay.className='fragment-transition';overlay.setAttribute('aria-hidden','true');
    const width=innerWidth,height=innerHeight,animations=[];
    const source=[...this.arrival.querySelectorAll('.arrival-film img')].find(photo=>photo.currentSrc.endsWith(image));
    const aspect=source?.naturalWidth/source?.naturalHeight||.75;
    const photoHeight=Math.max(height,width/aspect)*1.018,photoWidth=photoHeight*aspect;
    this.installation.classList.add('assembling');this.arrival.classList.add('unfolding');
    const cleanup=()=>{animations.forEach(animation=>animation.cancel());overlay.remove();this.installation.classList.remove('assembling');};
    signal.addEventListener('abort',cleanup,{once:true});
    try{
      for(const [index,shape]of fragmentShapes.entries()){
        const piece=document.createElement('div');piece.className='photograph-fragment';
        piece.style.backgroundImage=`url("${image}")`;piece.style.clipPath=`polygon(${shape.points.map(p=>`${p[0]*100}% ${p[1]*100}%`).join(',')})`;
        piece.style.backgroundSize=`${photoWidth}px ${photoHeight}px`;
        piece.style.transformOrigin=`${shape.center[0]*100}% ${shape.center[1]*100}%`;
        const target=this.scene.querySelector(`#past-art [data-reveal="${shape.target}"]`).getBoundingClientRect();
        const x=target.left+target.width/2-shape.center[0]*width,y=target.top+target.height/2-shape.center[1]*height;
        const angle=(index%2?1:-1)*(8+index*1.5),tilt=(index%3-1)*12;
        const end=`translate3d(${x}px,${y}px,-80px) rotateX(${tilt}deg) rotateY(${-tilt}deg) rotateZ(${angle}deg) scale(.42)`;
        overlay.append(piece);
        animations.push(piece.animate([
          {transform:'translate3d(0,0,0) rotate(0) scale(1)',opacity:1,filter:'brightness(.88) saturate(.75)'},
          {offset:.28,transform:`translate3d(${x*.15}px,${y*.15}px,${70+index*4}px) rotateZ(${angle*.4}deg) scale(.96)`,opacity:1,filter:'brightness(.9) saturate(.65)'},
          {offset:.78,transform:end,opacity:.65,filter:'brightness(.8) saturate(.35)'},
          {transform:end,opacity:0,filter:'brightness(.65) saturate(.2)'}
        ],{duration:3000+index*35,delay:index*24,easing:'cubic-bezier(.2,.65,.2,1)',fill:'both'}));
      }
      document.body.append(overlay);
      for(const piece of this.scene.querySelectorAll('.piece')){
        const shape=fragmentShapes.find(fragment=>fragment.target===piece.dataset.reveal)??fragmentShapes[4];
        const rect=piece.getBoundingClientRect(),x=shape.center[0]*width-rect.left-rect.width/2,y=shape.center[1]*height-rect.top-rect.height/2;
        const base=getComputedStyle(piece).transform;
        animations.push(piece.animate([
          {transform:`translate3d(${x}px,${y}px,130px) ${base} scale(.55)`,opacity:0},
          {offset:.25,opacity:0},
          {offset:.8,opacity:1},
          {transform:base,opacity:1}
        ],{duration:3300,delay:180,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'}));
      }
      await Promise.allSettled(animations.map(animation=>animation.finished));
    }finally{signal.removeEventListener('abort',cleanup);cleanup();}
  }
}
