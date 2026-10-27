// Original stereo train sound: rail joints, low rolling noise, motor and brakes.
// The audio context is created only inside a visitor's click handler.
export class RailAmbience {
  enabled=false;userMuted=false;journeyMode=false;speed=.85;timer;context;onState=()=>{};
  lastHoverAt=-Infinity;hoverTimes=new Map();
  setup(){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)throw new Error('Audio is unavailable');
    const ctx=this.context=new Audio();
    this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);
    const makeNoise=(brown=false)=>{
      const buffer=ctx.createBuffer(2,ctx.sampleRate*4,ctx.sampleRate);
      for(let channel=0;channel<2;channel++){
        const values=buffer.getChannelData(channel);let previous=0;
        for(let i=0;i<values.length;i++){
          const white=Math.random()*2-1;
          previous=(previous+white*.025)/1.025;
          values[i]=brown?previous*4.5:white*.45;
        }
      }
      return buffer;
    };
    this.white=makeNoise();
    this.roll=ctx.createBufferSource();this.roll.buffer=makeNoise(true);this.roll.loop=true;
    this.rollFilter=ctx.createBiquadFilter();this.rollFilter.type='lowpass';this.rollFilter.frequency.value=470;
    this.rollGain=ctx.createGain();this.rollGain.gain.value=.65;
    this.roll.connect(this.rollFilter);this.rollFilter.connect(this.rollGain);this.rollGain.connect(this.master);this.roll.start();
    this.air=ctx.createBufferSource();this.air.buffer=this.white;this.air.loop=true;
    const airFilter=ctx.createBiquadFilter();airFilter.type='highpass';airFilter.frequency.value=1100;
    this.airGain=ctx.createGain();this.airGain.gain.value=.035;
    this.air.connect(airFilter);airFilter.connect(this.airGain);this.airGain.connect(this.master);this.air.start();
    this.motor=ctx.createOscillator();this.motor.type='sine';this.motor.frequency.value=64;
    this.motorGain=ctx.createGain();this.motorGain.gain.value=.075;
    this.motor.connect(this.motorGain);this.motorGain.connect(this.master);this.motor.start();
    const resonance=ctx.createOscillator();resonance.type='sine';resonance.frequency.value=109;
    const resonanceGain=this.resonanceGain=ctx.createGain();resonanceGain.gain.value=.014;
    resonance.connect(resonanceGain);resonanceGain.connect(this.master);resonance.start();
  }
  async enable(volume=.32){
    const revision=this.audioRevision=(this.audioRevision??0)+1;
    clearTimeout(this.suspendTimer);
    if(!this.context)this.setup();
    if(!this.journeyMode)this.quietBackground(0);
    await this.context.resume();if(revision!==this.audioRevision)return;this.enabled=true;
    this.master.gain.setTargetAtTime(volume,this.context.currentTime,.55);
    this.schedule();this.onState();
  }
  silence(){
    this.audioRevision=(this.audioRevision??0)+1;
    this.enabled=false;clearTimeout(this.timer);
    if(this.context){this.master.gain.setTargetAtTime(0,this.context.currentTime,.3);clearTimeout(this.suspendTimer);this.suspendTimer=setTimeout(()=>{if(!this.enabled)this.context.suspend().catch(()=>{});},1500);}
    this.onState();
  }
  async toggle(){
    this.userMuted=this.enabled;
    if(this.enabled)this.silence();else await this.enable(.36);
    return this.enabled;
  }
  async muteJourney(muted){
    this.userMuted=muted;
    if(muted)this.silence();else if(this.journeyMode)await this.enable(.36);
    this.onState();
  }
  async startJourney(){
    this.journeyMode=true;this.speed=.9;this.modernCabin=false;this.hornPlayed=false;
    this.lastHoverAt=-Infinity;this.hoverTimes.clear();
    if(this.context)this.resonanceGain.gain.setTargetAtTime(.014,this.context.currentTime,.4);
    if(!this.userMuted)await this.enable(.36);
    if(this.journeyMode)this.phase('riding');
  }
  phase(phase){
    if(phase==='end'){this.journeyMode=false;this.speed=0;this.quietBackground();return;}
    const speed={riding:.9,morphing:.9,modern:.86,station:.5,exterior:.33,stopped:0}[phase];
    if(speed===undefined)return;
    this.speed=speed;
    if(!this.context)return;
    const t=this.context.currentTime;
    if(phase==='modern'){
      this.modernCabin=true;
      if(this.enabled&&!this.hornPlayed){this.hornPlayed=true;this.horn();}
    }
    this.roll.playbackRate.setTargetAtTime(Math.max(.25,speed),t,1);
    this.rollFilter.frequency.setTargetAtTime(130+speed*430,t,1.1);
    this.rollGain.gain.setTargetAtTime(.05+speed*(this.modernCabin?.4:.65),t,1.8);
    this.airGain.gain.setTargetAtTime(speed*.055,t,.9);
    this.motor.frequency.setTargetAtTime(35+speed*38,t,1.2);
    this.motorGain.gain.setTargetAtTime(.008+speed*.07,t,1.1);
    if(phase==='exterior'&&this.enabled)this.brakes();
    if(phase==='stopped'){
      clearTimeout(this.timer);
      if(this.enabled)this.airRelease();
    }
  }
  quietBackground(fade=.4){
    clearTimeout(this.timer);this.speed=0;
    if(!this.context)return;
    for(const node of [this.rollGain,this.airGain,this.motorGain,this.resonanceGain]){
      if(fade)node?.gain.setTargetAtTime(0,this.context.currentTime,fade);
      else node?.gain.setValueAtTime(0,this.context.currentTime);
    }
  }
  async enterCollage(){
    this.journeyMode=false;this.quietBackground();
    if(!this.userMuted)await this.enable(.36);
  }
  schedule(){
    clearTimeout(this.timer);if(!this.enabled||this.speed<.04)return;
    const ctx=this.context;
    for(const [index,offset]of [0,.105].entries()){
      const tick=ctx.createOscillator(),envelope=ctx.createGain(),pan=ctx.createStereoPanner();
      tick.type='triangle';tick.frequency.setValueAtTime(125,ctx.currentTime+offset);tick.frequency.exponentialRampToValueAtTime(38,ctx.currentTime+offset+.075);
      envelope.gain.setValueAtTime(0,ctx.currentTime+offset);envelope.gain.linearRampToValueAtTime((this.modernCabin?.12:.24)+this.speed*.12,ctx.currentTime+offset+.004);envelope.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+offset+.1);
      pan.pan.value=index? .28:-.28;tick.connect(envelope);envelope.connect(pan);pan.connect(this.master);
      tick.start(ctx.currentTime+offset);tick.stop(ctx.currentTime+offset+.13);
      tick.onended=()=>{tick.disconnect();envelope.disconnect();pan.disconnect();};
    }
    this.timer=setTimeout(()=>this.schedule(),Math.min(2000,560/Math.max(.1,this.speed)));
  }
  horn(){
    if(!this.enabled||this.userMuted||!this.context)return;
    const ctx=this.context,t=ctx.currentTime;
    // A prominent approach chord, with the existing cabin ambience underneath.
    for(const [index,frequency] of [246.94,311.13,369.99].entries()){
      const tone=ctx.createOscillator(),filter=ctx.createBiquadFilter(),envelope=ctx.createGain(),pan=ctx.createStereoPanner();
      tone.type='sawtooth';tone.frequency.setValueAtTime(frequency*.985,t);tone.frequency.exponentialRampToValueAtTime(frequency,t+.18);
      filter.type='lowpass';filter.frequency.value=1050;filter.Q.value=.65;pan.pan.value=(index-1)*.11;
      envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(.18,t+.14);envelope.gain.setTargetAtTime(.13,t+.25,.18);envelope.gain.setTargetAtTime(.0001,t+.9,.18);
      tone.connect(filter);filter.connect(envelope);envelope.connect(pan);pan.connect(this.master);tone.start(t);tone.stop(t+1.8);
      tone.onended=()=>{tone.disconnect();filter.disconnect();envelope.disconnect();pan.disconnect();};
    }
  }
  hover(id){
    const ctx=this.context;
    if(!['train','tram','bus'].includes(id)||!this.enabled||this.userMuted||this.journeyMode||!ctx||ctx.state!=='running')return false;
    const now=ctx.currentTime;
    if(now-this.lastHoverAt<.8||now-(this.hoverTimes.get(id)??-Infinity)<1.6)return false;
    this.lastHoverAt=now;this.hoverTimes.set(id,now);
    if(id==='train'){
      // A cheerful, rising two-part "choo-choo".
      this.playfulNote({frequency:392,to:523,volume:.23,hold:.12,release:.16,pan:-.12});
      this.playfulNote({frequency:523,to:659,delay:.26,volume:.2,hold:.15,release:.18,pan:.12});
    }else if(id==='tram'){
      // Two small bells, with soft upper partials for a rounded metallic ding.
      for(const delay of [0,.22])for(const [frequency,volume]of [[1046.5,.17],[2093,.055],[3139.5,.025]]){
        this.playfulNote({frequency,type:'sine',delay,volume,attack:.004,hold:0,release:.42,pan:delay? .14:-.14});
      }
    }else{
      // A rubbery, descending bus "beep-bop".
      this.playfulNote({frequency:330,to:440,type:'square',volume:.16,hold:.07,release:.1,pan:-.1});
      this.playfulNote({frequency:294,to:196,type:'square',delay:.2,volume:.18,hold:.08,release:.17,pan:.1});
    }
    return true;
  }
  playfulNote({frequency,to=frequency,type='triangle',delay=0,volume=.2,attack=.025,hold=.1,release=.2,pan=0}){
    const ctx=this.context,t=ctx.currentTime+delay,end=t+attack+hold+release;
    const tone=ctx.createOscillator(),filter=ctx.createBiquadFilter(),envelope=ctx.createGain(),stereo=ctx.createStereoPanner();
    tone.type=type;tone.frequency.setValueAtTime(frequency,t);tone.frequency.exponentialRampToValueAtTime(to,t+attack+hold+release*.55);
    filter.type='lowpass';filter.frequency.value=type==='sine'?4200:1500;filter.Q.value=.65;stereo.pan.value=pan;
    envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(volume,t+attack);envelope.gain.setValueAtTime(volume,t+attack+hold);envelope.gain.exponentialRampToValueAtTime(.0001,end);
    tone.connect(filter);filter.connect(envelope);envelope.connect(stereo);stereo.connect(this.master);tone.start(t);tone.stop(end+.03);
    tone.onended=()=>{tone.disconnect();filter.disconnect();envelope.disconnect();stereo.disconnect();};
  }
  brakes(){
    const ctx=this.context,t=ctx.currentTime,noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    noise.buffer=this.white;filter.type='bandpass';filter.Q.value=5;filter.frequency.setValueAtTime(1800,t);filter.frequency.exponentialRampToValueAtTime(650,t+3.2);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.6);gain.gain.exponentialRampToValueAtTime(.001,t+3.5);
    noise.connect(filter);filter.connect(gain);gain.connect(this.master);noise.start();noise.stop(t+3.6);
    noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect();};
  }
  airRelease(){
    const ctx=this.context,t=ctx.currentTime,noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    noise.buffer=this.white;filter.type='lowpass';filter.frequency.value=2200;gain.gain.setValueAtTime(.11,t);gain.gain.exponentialRampToValueAtTime(.001,t+1.4);
    noise.connect(filter);filter.connect(gain);gain.connect(this.master);noise.start();noise.stop(t+1.5);
    noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect();};
  }
  async visibility(hidden){
    if(!this.context)return;
    if(hidden){clearTimeout(this.timer);await this.context.suspend();}
    else if(this.enabled){await this.context.resume();this.schedule();}
  }
}
