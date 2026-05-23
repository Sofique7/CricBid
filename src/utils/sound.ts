class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Browser AudioContext initialization is deferred to user interaction
  }

  private initCtx() {
    if (this.ctx) return;
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public playBidSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // High-pitched synth pluck/chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.08); // Jump to C6

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  public playGavelSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Double gavel knock sound: woodblock thud
      const playThud = (delay: number) => {
        if (!this.ctx) return;
        const time = this.ctx.currentTime + delay;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.linearRampToValueAtTime(70, time + 0.06);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.start(time);
        osc.stop(time + 0.08);
      };

      playThud(0);
      playThud(0.14); // Double knock
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  public playSoldSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Triumph sound: G-major triad arpeggio chime
      const playTone = (freq: number, startDelay: number, duration: number) => {
        if (!this.ctx) return;
        const time = this.ctx.currentTime + startDelay;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.start(time);
        osc.stop(time + duration);
      };

      playTone(392.00, 0.0, 0.35); // G4
      playTone(493.88, 0.08, 0.35); // B4
      playTone(587.33, 0.16, 0.45); // D5
      playTone(783.99, 0.24, 0.65); // G5
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  public playBuzzerSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Low synth warning buzz
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  public playCrowdCheer() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const duration = 3.5;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Noise source
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Filter to shape crowd noise (low-pass filter)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      // Dynamic frequency sweep to simulate a cheering crowd
      filter.frequency.setValueAtTime(250, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.6);
      filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + duration);

      // Gain node for crowd sound
      const crowdGain = this.ctx.createGain();
      crowdGain.gain.setValueAtTime(0, this.ctx.currentTime);
      crowdGain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.5);
      crowdGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(crowdGain);
      crowdGain.connect(this.ctx.destination);

      noiseSource.start();
      noiseSource.stop(this.ctx.currentTime + duration);

      // Helper for high-pitched excited whistles
      const playWhistle = (startTimeOffset: number, whistleDur: number, startFreq: number, endFreq: number, volume: number) => {
        if (!this.ctx) return;
        const time = this.ctx.currentTime + startTimeOffset;

        const osc = this.ctx.createOscillator();
        const fmOsc = this.ctx.createOscillator(); // Vibrato LFO
        const fmGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + whistleDur);

        // Fast pitch modulation for whistle warble (vibrato)
        fmOsc.frequency.setValueAtTime(15, time); // 15 Hz modulation
        fmGain.gain.setValueAtTime(30, time); // 30 Hz pitch deviation

        fmOsc.connect(fmGain);
        fmGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + whistleDur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        fmOsc.start(time);
        osc.start(time);

        fmOsc.stop(time + whistleDur);
        osc.stop(time + whistleDur);
      };

      // Add a couple of high-pitched crowd whistles at the peak
      playWhistle(0.2, 1.2, 950, 1600, 0.04);
      playWhistle(0.4, 0.8, 1200, 1900, 0.03);
      playWhistle(0.7, 1.0, 850, 1400, 0.04);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  public playSoftBell() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const time = this.ctx.currentTime;
      // F-minor 9th chord frequencies: F3 (174.61), Ab3 (207.65), C4 (261.63), Eb4 (311.13), G4 (392.00)
      const freqs = [174.61, 207.65, 261.63, 311.13, 392.00];
      const duration = 2.8;

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Use triangle waves for a warmer, softer bell chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        // Add a subtle second harmonic to make it sound richer
        const harmOsc = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(freq * 2, time);

        gain.gain.setValueAtTime(0, time);
        // Slightly stagger onset to sound more delicate
        const onset = 0.02 * idx;
        gain.gain.linearRampToValueAtTime(0.06, time + onset + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        harmGain.gain.setValueAtTime(0, time);
        harmGain.gain.linearRampToValueAtTime(0.02, time + onset + 0.04);
        harmGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        harmOsc.connect(harmGain);
        harmGain.connect(this.ctx.destination);

        osc.start(time);
        harmOsc.start(time);

        osc.stop(time + duration);
        harmOsc.stop(time + duration);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }
}

export const soundEffects = new SoundEffectsManager();
export default soundEffects;
