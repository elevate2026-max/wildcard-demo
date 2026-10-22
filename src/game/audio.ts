// Web Audio playback for every slot in public/audio/<slot>.mp3.
// Web Audio (not <audio>) so one tap on "Play" unlocks every later clip on iOS/Android.
// Game flow never waits on a file: a missing/failed clip resolves on a text-length timer instead.
import { ALL_SLOTS, VOICE, type AudioSlot, type SfxSlot, type VoiceSlot } from "./script";

const GAIN: Partial<Record<AudioSlot, number>> = {
  sfx_theme_sting: 0.55,
  sfx_bed_question: 0.28,
  sfx_tick: 0.5,
  sfx_correct: 0.45,
  sfx_wrong: 0.3,
  sfx_timeout: 0.3,
  sfx_aiden_sting: 0.5,
  sfx_drumroll: 0.6,
  sfx_applause: 0.5,
  sfx_button: 0.4,
};

type Loop = { src: AudioBufferSourceNode; gain: GainNode };

export function fallbackMs(slot: VoiceSlot): number {
  return Math.max(1500, VOICE[slot].text.split(/\s+/).length * 380);
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<AudioSlot, AudioBuffer>();
  private loops = new Map<SfxSlot, Loop>();
  private voice: { src: AudioBufferSourceNode; done: () => void } | null = null;
  private loading: Promise<void> | null = null;
  muted = false;

  /** Starts fetching + decoding every slot. Resolves when all have settled (some may have failed). */
  load(onProgress?: (done: number, total: number) => void): Promise<void> {
    if (this.loading) return this.loading;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    let done = 0;
    this.loading = Promise.all(
      ALL_SLOTS.map(async (slot) => {
        try {
          const res = await fetch(`/audio/${slot}.mp3`);
          if (!res.ok) throw new Error(`${slot}: HTTP ${res.status}`);
          const data = await res.arrayBuffer();
          this.buffers.set(slot, await this.ctx!.decodeAudioData(data));
        } catch (err) {
          console.warn("audio slot failed to load", slot, err);
        } finally {
          onProgress?.(++done, ALL_SLOTS.length);
        }
      }),
    ).then(() => undefined);
    return this.loading;
  }

  /** Call from a user gesture (the Play button). */
  async unlock() {
    // iOS 17+: play through the ringer/silent switch like a video would.
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) {
      try {
        nav.audioSession.type = "playback";
      } catch {
        /* older WebKit */
      }
    }
    if (this.ctx && this.ctx.state !== "running") await this.ctx.resume().catch(() => {});
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.02);
  }

  get loadedCount() {
    return this.buffers.size;
  }

  private start(slot: AudioSlot, loop = false): { src: AudioBufferSourceNode; gain: GainNode } | null {
    const buf = this.buffers.get(slot);
    if (!buf || !this.ctx || !this.master) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    const gain = this.ctx.createGain();
    gain.gain.value = GAIN[slot] ?? 1;
    src.connect(gain).connect(this.master);
    src.start();
    return { src, gain };
  }

  /** Fire-and-forget SFX. Resolves when it finishes (or straight away if it couldn't play). */
  sfx(slot: SfxSlot): Promise<void> {
    const node = this.start(slot);
    if (!node) return Promise.resolve();
    return new Promise((resolve) => {
      node.src.onended = () => resolve();
    });
  }

  loop(slot: SfxSlot) {
    if (this.loops.has(slot)) return;
    const node = this.start(slot, true);
    if (node) this.loops.set(slot, node);
  }

  stopLoop(slot: SfxSlot, fadeS = 0.25) {
    const node = this.loops.get(slot);
    if (!node || !this.ctx) return;
    this.loops.delete(slot);
    node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, fadeS / 3);
    node.src.stop(this.ctx.currentTime + fadeS);
  }

  stopAllLoops() {
    for (const slot of [...this.loops.keys()]) this.stopLoop(slot, 0.1);
  }

  /** Plays a voice line; resolves when it ends, is skipped, or (no buffer) after a reading-time fallback. */
  playVoice(slot: VoiceSlot): Promise<void> {
    this.stopVoice();
    return new Promise((resolve) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout>;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (this.voice?.done === done) this.voice = null;
        resolve();
      };
      const node = this.start(slot);
      if (!node) {
        timer = setTimeout(done, fallbackMs(slot));
        this.voice = { src: null as unknown as AudioBufferSourceNode, done };
        return;
      }
      node.src.onended = done;
      // Safety net: never hang the show if `ended` doesn't fire (suspended context, tab backgrounded).
      timer = setTimeout(done, node.src.buffer!.duration * 1000 + 1500);
      this.voice = { src: node.src, done };
    });
  }

  stopVoice() {
    const v = this.voice;
    if (!v) return;
    this.voice = null;
    try {
      v.src?.stop();
    } catch {
      /* already stopped */
    }
    v.done();
  }

  stopAll() {
    this.stopVoice();
    this.stopAllLoops();
  }
}
