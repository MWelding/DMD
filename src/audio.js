// An original, synthesised rail ambience. No recordings, requests, or autoplay.
export class RailAmbience {
  context; gain; enabled = false; timer;
  async toggle() {
    if (!this.context) this.setup();
    await this.context.resume();
    this.enabled = !this.enabled;
    this.gain.gain.setTargetAtTime(this.enabled ? 0.12 : 0, this.context.currentTime, 0.35);
    if (this.enabled) this.schedule(); else clearTimeout(this.timer);
    return this.enabled;
  }
  setup() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw new Error('Audio is not available in this browser');
    const ctx = this.context = new Audio();
    const gain = this.gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const values = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < values.length; i++) { last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02; values[i] = last * 5; }
    const noise = ctx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 370;
    noise.connect(filter); filter.connect(gain); noise.start();
    const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 54;
    const humGain = ctx.createGain(); humGain.gain.value = 0.12; hum.connect(humGain); humGain.connect(gain); hum.start();
  }
  schedule() {
    if (!this.enabled) return;
    const ctx = this.context;
    for (const offset of [0, 0.14]) {
      const tick = ctx.createOscillator(); const envelope = ctx.createGain();
      tick.frequency.setValueAtTime(140, ctx.currentTime + offset); tick.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + offset + 0.08);
      envelope.gain.setValueAtTime(0, ctx.currentTime + offset); envelope.gain.linearRampToValueAtTime(0.55, ctx.currentTime + offset + 0.003); envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.1);
      tick.connect(envelope); envelope.connect(this.gain); tick.start(ctx.currentTime + offset); tick.stop(ctx.currentTime + offset + 0.12);
    }
    this.timer = setTimeout(() => this.schedule(), 820);
  }
  async visibility(hidden) {
    if (!this.context) return;
    if (hidden) { clearTimeout(this.timer); await this.context.suspend(); }
    else if (this.enabled) { await this.context.resume(); this.schedule(); }
  }
}
