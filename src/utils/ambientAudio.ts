/**
 * ระบบสังเคราะห์เสียงบรรยากาศคืนลอยกระทงด้วย Web Audio API
 * (ไม่ต้องพึ่งไฟล์เสียงภายนอก ทำงานได้เสถียรทั้งบนมือถือและเดสก์ท็อป)
 */
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private chimeTimer: number | null = null;
  private isPlaying = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public start(): boolean {
    if (this.isPlaying) return true;
    const ctx = this.ensureContext();
    if (!ctx) return false;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 1.4);
    master.connect(ctx.destination);
    this.masterGain = master;

    // 1. Gentle flowing river murmur (filtered soft noise with slow LFO)
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 2.4;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const waterFilter = ctx.createBiquadFilter();
    waterFilter.type = 'bandpass';
    waterFilter.frequency.setValueAtTime(340, ctx.currentTime);
    waterFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    const waterLfo = ctx.createOscillator();
    waterLfo.frequency.setValueAtTime(0.14, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(95, ctx.currentTime);
    waterLfo.connect(lfoGain);
    lfoGain.connect(waterFilter.frequency);

    const waterGain = ctx.createGain();
    waterGain.gain.setValueAtTime(0.24, ctx.currentTime);

    noiseSource.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(master);

    noiseSource.start();
    waterLfo.start();

    // 2. Soft Thai-inspired pentatonic wind chimes
    const pentatonicNotes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const playSoftNote = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const freq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.065, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 3.3);
    };

    playSoftNote();
    this.chimeTimer = window.setInterval(() => {
      if (Math.random() > 0.25) {
        playSoftNote();
      }
    }, 2800);

    this.isPlaying = true;
    return true;
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.ctx && this.masterGain) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || 0.1, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      } catch {
        // Ignore ramp errors during teardown
      }
    }
    const oldCtx = this.ctx;
    this.ctx = null;
    this.masterGain = null;
    if (oldCtx) {
      window.setTimeout(() => {
        void oldCtx.close().catch(() => {});
      }, 400);
    }
  }

  public playLaunchChime(enabled: boolean): void {
    if (!enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const startAt = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 1.9);
    });
  }

  public playHeartPluck(enabled: boolean): void {
    if (!enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }
}

export const ambientAudio = new AmbientAudioEngine();
