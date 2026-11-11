// Web Audio API emergency siren synthesizer

class SirenManager {
  private audioCtx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playSiren() {
    try {
      this.initContext();
      if (!this.audioCtx || this.isPlaying) return;

      const ctx = this.audioCtx;
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.06, ctx.currentTime); // gentle, comfortable volume

      this.osc1 = ctx.createOscillator();
      this.osc1.type = 'sawtooth';

      // LFO for frequency modulation (European two-tone / wail ambulance siren)
      this.lfo = ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(1.5, ctx.currentTime); // 1.5 Hz modulation cycle

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(220, ctx.currentTime); // sweep range +- 220Hz

      this.osc1.frequency.setValueAtTime(780, ctx.currentTime); // center frequency
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.osc1.frequency);

      this.osc1.connect(this.gainNode);
      this.gainNode.connect(ctx.destination);

      this.osc1.start();
      this.lfo.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio siren context issue:', e);
    }
  }

  public stopSiren() {
    try {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      }
      setTimeout(() => {
        if (this.osc1) {
          try { this.osc1.stop(); this.osc1.disconnect(); } catch (_) {}
          this.osc1 = null;
        }
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch (_) {}
          this.lfo = null;
        }
        this.isPlaying = false;
      }, 350);
    } catch (e) {
      console.warn('Error stopping siren:', e);
      this.isPlaying = false;
    }
  }

  public playBeep(freq = 880, durationMs = 150) {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (_) {}
  }

  public toggle(forceState?: boolean): boolean {
    const target = forceState !== undefined ? forceState : !this.isPlaying;
    if (target) {
      this.playSiren();
    } else {
      this.stopSiren();
    }
    return target;
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const sirenAudio = new SirenManager();
