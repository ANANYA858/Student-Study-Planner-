/**
 * Multi-Soundscape Audio Engine for Deep Work & Pomodoro Focus
 * Pure Web Audio API synthesis: 'Rain', 'Cafe White Noise', and 'Deep Binaural Beats'
 * Zero external audio files required.
 */

export type SoundscapeType = 'rain' | 'cafe' | 'binaural';

export interface SoundscapeOption {
  id: SoundscapeType;
  name: string;
  emoji: string;
  desc: string;
  tag: string;
}

export const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  {
    id: 'rain',
    name: 'Rain',
    emoji: '🌧️',
    desc: 'Soft steady rainfall & brown noise',
    tag: 'Calm & Steady',
  },
  {
    id: 'cafe',
    name: 'Cafe White Noise',
    emoji: '☕',
    desc: 'Warm coffeehouse murmur & ambient texture',
    tag: 'Creative Flow',
  },
  {
    id: 'binaural',
    name: 'Deep Binaural Beats',
    emoji: '🧘',
    desc: '10Hz Alpha wave harmonic focus differential',
    tag: 'Deep Cognitive',
  },
];

class MultiSoundscapeGenerator {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType = 'rain';
  private activeNodes: AudioNode[] = [];
  private gainNode: GainNode | null = null;
  private active = false;
  private volume = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public getSoundscape(): SoundscapeType {
    return this.currentType;
  }

  public isPlaying(): boolean {
    return this.active;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  private stopCurrentNodes() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.activeNodes = [];
  }

  public play(type?: SoundscapeType) {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (type) {
      this.currentType = type;
    }

    // Stop whatever was playing
    this.stopCurrentNodes();

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(this.volume, this.ctx.currentTime + 0.8);
    masterGain.connect(this.ctx.destination);
    this.gainNode = masterGain;

    if (this.currentType === 'rain') {
      this.setupRain(masterGain);
    } else if (this.currentType === 'cafe') {
      this.setupCafe(masterGain);
    } else if (this.currentType === 'binaural') {
      this.setupBinaural(masterGain);
    }

    this.active = true;
  }

  public pause() {
    if (!this.active || !this.ctx || !this.gainNode) return;

    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
    setTimeout(() => {
      this.stopCurrentNodes();
      this.active = false;
    }, 450);
  }

  public toggle(type?: SoundscapeType): boolean {
    if (this.active) {
      if (type && type !== this.currentType) {
        this.play(type);
        return true;
      }
      this.pause();
      return false;
    } else {
      this.play(type || this.currentType);
      return true;
    }
  }

  // --- Soundscape 1: Rain (Brown Noise + Lowpass Filter) ---
  private setupRain(outputNode: GainNode) {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(outputNode);

    source.start();
    this.activeNodes.push(source, filter);
  }

  // --- Soundscape 2: Cafe White Noise (Bandpass Filtered Ambience + Gentle Flutter) ---
  private setupCafe(outputNode: GainNode) {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pinkish/warm white noise
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.45;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Bandpass filter for ambient coffeehouse hiss and background murk
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // Low-frequency LFO to simulate organic room presence/breathing
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime); // gentle 4s wave

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(outputNode);

    lfo.start();
    source.start();
    this.activeNodes.push(source, filter, lfo, lfoGain);
  }

  // --- Soundscape 3: Deep Binaural Beats (10Hz Alpha Harmonic Synchronizer) ---
  private setupBinaural(outputNode: GainNode) {
    if (!this.ctx) return;

    // Base pitch (Carrier: 216 Hz)
    const baseFreq = 216;
    const beatFreq = 10; // 10Hz Alpha focus brainwave

    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();

    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

    // Warm sub-drone oscillator for depth
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(108, this.ctx.currentTime); // Octave below

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(outputNode);

    // Stereo Panning for Binaural Effect
    if ('createStereoPanner' in this.ctx) {
      const panLeft = this.ctx.createStereoPanner();
      panLeft.pan.setValueAtTime(-1, this.ctx.currentTime);
      oscLeft.connect(panLeft);
      panLeft.connect(outputNode);

      const panRight = this.ctx.createStereoPanner();
      panRight.pan.setValueAtTime(1, this.ctx.currentTime);
      oscRight.connect(panRight);
      panRight.connect(outputNode);

      this.activeNodes.push(panLeft, panRight);
    } else {
      // Fallback: direct feed
      oscLeft.connect(outputNode);
      oscRight.connect(outputNode);
    }

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    this.activeNodes.push(oscLeft, oscRight, subOsc, subGain);
  }
}

export const ambientAudio = new MultiSoundscapeGenerator();
