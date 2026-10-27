// Horizontal displacement keeps photographic texture while the silhouette bends,
// following the elastic architectural loop in the supplied Ana Cosma GIF.
export const waveObjects=[
  {name:'station',seed:4,frequency:'.006 .009',alternate:'.009 .014',scale:'18;42;18',contrast:2.2,duration:12},
  {name:'tram',seed:9,frequency:'.009 .012',alternate:'.014 .018',scale:'7;17;7',duration:10},
  {name:'bus',seed:6,frequency:'.008 .012',alternate:'.012 .018',scale:'9;21;9',duration:11}
];

export function waveDefinitions(){
  return `<svg class="motion-definitions" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${waveObjects.map(object=>`<filter id="elastic-${object.name}" x="-18%" y="-8%" width="136%" height="116%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${object.frequency}" numOctaves="1" seed="${object.seed}" result="noise"><animate attributeName="baseFrequency" values="${object.frequency};${object.alternate};${object.frequency}" dur="${object.duration}s" calcMode="spline" keyTimes="0;.5;1" keySplines=".42 0 .58 1;.42 0 .58 1" repeatCount="indefinite"/></feTurbulence>
    <feColorMatrix in="noise" type="matrix" values="${object.contrast??1} 0 0 0 ${(1-(object.contrast??1))/2}  0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 1" result="horizontal-wave"/>
    <feDisplacementMap in="SourceGraphic" in2="horizontal-wave" scale="0" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" values="${object.scale}" dur="${object.duration}s" calcMode="spline" keyTimes="0;.5;1" keySplines=".42 0 .58 1;.42 0 .58 1" repeatCount="indefinite"/></feDisplacementMap>
  </filter>`).join('')}</defs></svg>`;
}

const rigaClock=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Riga',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
export function clockAngles(date=new Date()){
  const values=Object.fromEntries(rigaClock.formatToParts(date).map(part=>[part.type,part.value]));
  const second=Number(values.second)+date.getMilliseconds()/1000,minute=Number(values.minute)+second/60,hour=Number(values.hour)%12+minute/60;
  return {hour:hour*30,minute:minute*6,second:second*6};
}

export class CollageMotion {
  constructor({installation,scene,reducedMotion}){
    Object.assign(this,{installation,scene,reducedMotion});
    installation.insertAdjacentHTML('afterbegin',waveDefinitions());
    this.definitions=installation.querySelector('.motion-definitions');this.definitions.pauseAnimations();
    this.onChange=()=>this.sync();
    document.addEventListener('visibilitychange',this.onChange);
    reducedMotion.addEventListener('change',this.onChange);
    this.active=false;this.panelOpen=false;this.sync();
  }
  setActive(active){this.active=active;this.sync();}
  setPanelOpen(open){this.panelOpen=open;this.sync();}
  sync(){
    const running=this.active&&!this.panelOpen&&!document.hidden&&!this.reducedMotion.matches;
    this.installation.dataset.deform=this.active&&!this.reducedMotion.matches?'enabled':'disabled';
    if(running===this.running)return;
    this.running=running;this.installation.dataset.motion=running?'running':'paused';
    if(running){
      const angles=clockAngles();
      for(const [hand,angle]of Object.entries(angles))this.scene.style.setProperty(`--clock-${hand}`,`${angle}deg`);
      this.scene.classList.remove('clock-running');void this.scene.offsetWidth;this.scene.classList.add('clock-running');
      this.definitions.unpauseAnimations();
    }else this.definitions.pauseAnimations();
  }
}
