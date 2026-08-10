// Web Audio API ambient sound generator & notification chime
class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentType: 'rain' | 'white-noise' | 'deep-space' | 'lofi-hum' = 'rain';

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public play(type: 'rain' | 'white-noise' | 'deep-space' | 'lofi-hum' = 'rain', volume = 0.15) {
    this.stop();
    const ctx = this.getContext();
    this.currentType = type;

    // Buffer size for 2 seconds of noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        // Pink noise filter for rain
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else if (type === 'deep-space') {
        // Brown noise filter for deep space
        output[i] = (lastOut + 0.01 * white) / 1.01;
        lastOut = output[i];
        output[i] *= 4.5;
      } else {
        // Pure soft white noise
        output[i] = white * 0.15;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter
    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
    } else if (type === 'deep-space') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
    } else if (type === 'lofi-hum') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
    }

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    whiteNoise.start(0);
    this.noiseNode = whiteNoise;
    this.isPlaying = true;
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public playChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // ignore
    }
  }

  public getStatus() {
    return { isPlaying: this.isPlaying, type: this.currentType };
  }
}

export const soundscapes = new SoundscapeEngine();
