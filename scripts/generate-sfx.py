"""Generates the 10 music & SFX slots from the host script as original synthesized audio.

Everything here is synthesized from scratch (oscillators + filtered noise), so the
output is royalty-free with no third-party license attached. Deterministic (fixed seed).

    python3 scripts/generate-sfx.py <out_dir>    # writes <slot>.wav; npm run sfx converts to mp3
"""
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(20261203)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def env(n, a=0.005, r=0.2, total=None):
    """Attack / exponential release envelope over n samples."""
    x = np.arange(n) / SR
    e = np.minimum(1.0, x / max(a, 1e-4))
    return e * np.exp(-x / max(r, 1e-4))


def adsr(n, a=0.01, d=0.1, s=0.7, r=0.1):
    out = np.full(n, s, dtype=float)
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    ai = min(ai, n)
    out[:ai] = np.linspace(0, 1, ai, endpoint=False)
    de = min(ai + di, n)
    out[ai:de] = np.linspace(1, s, de - ai, endpoint=False)
    if ri > 0 and ri < n:
        out[-ri:] *= np.linspace(1, 0, ri)
    return out


def saw(f, d):
    x = t(d)
    out = np.zeros_like(x)
    for k in range(1, 14):
        if f * k > SR / 2.5:
            break
        out += ((-1) ** (k + 1)) * np.sin(2 * np.pi * f * k * x) / k
    return out * 0.6


def square(f, d):
    x = t(d)
    out = np.zeros_like(x)
    for k in range(1, 18, 2):
        if f * k > SR / 2.5:
            break
        out += np.sin(2 * np.pi * f * k * x) / k
    return out * 0.8


def sine(f, d):
    return np.sin(2 * np.pi * f * t(d))


def lowpass(x, cutoff):
    # Windowed-sinc FIR.
    taps = 101
    fc = cutoff / SR
    n = np.arange(taps) - (taps - 1) / 2
    h = np.sinc(2 * fc * n) * np.hamming(taps)
    h /= h.sum()
    return np.convolve(x, h, mode="same")


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def noise(d):
    return rng.uniform(-1, 1, int(SR * d))


def mix_at(buf, sig, at):
    i = int(at * SR)
    end = min(len(buf), i + len(sig))
    buf[i:end] += sig[: end - i]


def bell(f, d, r=0.6):
    n = int(SR * d)
    x = t(d)
    s = np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * f * 2.76 * x) + 0.2 * np.sin(2 * np.pi * f * 5.4 * x)
    return s * env(n, 0.002, r)


def kick(d=0.4):
    x = t(d)
    f = 50 + 110 * np.exp(-x * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(x), 0.001, 0.12)


def snare(d=0.25, r=0.07):
    n = int(SR * d)
    return (highpass(noise(d), 1500) * 0.8 + 0.3 * sine(190, d)) * env(n, 0.001, r)


def hat(d=0.06):
    n = int(SR * d)
    return highpass(noise(d), 7000) * env(n, 0.001, 0.015)


def crash(d=2.0):
    n = int(SR * d)
    return highpass(noise(d), 4000) * env(n, 0.002, 0.6)


def brass_chord(freqs, d, cutoff=2600):
    n = int(SR * d)
    s = sum(saw(f, d) + 0.5 * saw(f * 1.004, d) for f in freqs)
    s = lowpass(s, cutoff)
    return s * adsr(n, 0.015, 0.12, 0.65, min(0.25, d / 2)) / len(freqs)


def norm(x, peak=0.89):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# --- slots -------------------------------------------------------------------

def theme_sting():
    # Punchy brass hits I - bVII - IV - I in D major-ish, 132 bpm, with drums; ~6.3s.
    d = 6.4
    buf = np.zeros(int(SR * d))
    beat = 60 / 132
    hits = [
        (0.0, [62, 66, 69, 74], 0.35),
        (beat * 0.75, [62, 66, 69, 74], 0.25),
        (beat * 1.5, [60, 64, 67, 72], 0.55),
        (beat * 2.5, [55, 59, 62, 67], 0.35),
        (beat * 3.25, [55, 59, 62, 67], 0.25),
        (beat * 4.0, [57, 61, 64, 69], 0.6),
        (beat * 5.5, [62, 66, 69, 74, 78], 3.2),
    ]
    for at, notes, dur in hits:
        mix_at(buf, brass_chord([midi(n) for n in notes], dur), at)
        mix_at(buf, 0.6 * brass_chord([midi(notes[0] - 12)], dur, 900), at)
    for i in range(12):
        at = i * beat / 2
        if i % 2 == 0:
            mix_at(buf, 0.9 * kick(), at)
        else:
            mix_at(buf, 0.6 * snare(), at)
        mix_at(buf, 0.3 * hat(), at)
    mix_at(buf, 0.9 * kick(), beat * 5.5)
    mix_at(buf, 0.5 * crash(2.5), beat * 5.5)
    # Sparkle run up into the final hit.
    for k, n in enumerate([74, 78, 81, 86, 90]):
        mix_at(buf, 0.25 * bell(midi(n), 0.6, 0.25), beat * 4.6 + k * 0.07)
    fade = int(0.6 * SR)
    buf[-fade:] *= np.linspace(1, 0, fade)
    return norm(buf)


def bed_question():
    # Seamless 4-bar loop at 120 bpm (8.0s): pulsing bass, muted chords, hats.
    bpm = 120
    beat = 60 / bpm
    d = beat * 16
    buf = np.zeros(int(SR * d))
    prog = [(38, [62, 65, 69]), (34, [58, 62, 65]), (36, [60, 64, 67]), (33, [57, 61, 64])]
    for bar, (bass, chord) in enumerate(prog):
        b0 = bar * 4 * beat
        for e in range(8):
            at = b0 + e * beat / 2
            n = int(SR * beat / 2 * 0.9)
            s = lowpass(square(midi(bass), beat / 2 * 0.9), 500) * env(n, 0.004, 0.12)
            mix_at(buf, 0.45 * s, at)
            mix_at(buf, 0.12 * hat(), at + beat / 4)
        for q in (1, 3):
            mix_at(buf, 0.18 * brass_chord([midi(n) for n in chord], beat * 0.4, 1400), b0 + q * beat)
        mix_at(buf, 0.35 * kick(), b0)
        mix_at(buf, 0.35 * kick(), b0 + 2 * beat)
    return norm(buf, 0.6)


def tick():
    # 1.0s loop: tick at 0.0, tock at 0.5.
    buf = np.zeros(SR)
    for at, f in ((0.0, 2400), (0.5, 1800)):
        n = int(0.04 * SR)
        s = (np.sin(2 * np.pi * f * t(0.04)) + 0.5 * highpass(noise(0.04), 3000)) * env(n, 0.0005, 0.006)
        mix_at(buf, s, at)
    return norm(buf, 0.8)


def correct():
    d = 1.6
    buf = np.zeros(int(SR * d))
    for k, n in enumerate([72, 76, 79, 84]):
        mix_at(buf, bell(midi(n), 1.2, 0.5), k * 0.08)
    mix_at(buf, 0.5 * brass_chord([midi(n) for n in (60, 64, 67, 72)], 0.9, 3000), 0.3)
    return norm(buf)


def wrong():
    d = 1.1
    buf = np.zeros(int(SR * d))
    for at in (0.0, 0.42):
        n = int(0.36 * SR)
        s = (square(110, 0.36) + square(116.5, 0.36)) * adsr(n, 0.005, 0.05, 0.8, 0.05)
        mix_at(buf, lowpass(s, 1800), at)
    return norm(buf, 0.75)


def timeout():
    # Descending "wah-wah-wah-waaah".
    d = 2.6
    buf = np.zeros(int(SR * d))
    notes = [(62, 0.0, 0.42), (61, 0.45, 0.42), (60, 0.9, 0.42), (59, 1.35, 1.2)]
    for n, at, dur in notes:
        x = t(dur)
        f = midi(n) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * x) * (x > 0.3))
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = sum(np.sin(k * ph) / k for k in range(1, 9))
        wah = 0.55 + 0.45 * np.sin(2 * np.pi * (1 / dur) * x - np.pi / 2)
        mix_at(buf, lowpass(s * wah, 1600) * adsr(len(x), 0.02, 0.05, 0.85, 0.12), at)
    return norm(buf, 0.8)


def aiden_sting():
    # Playful: boing + xylophone run + cymbal splash; ~2.2s.
    d = 2.3
    buf = np.zeros(int(SR * d))
    x = t(0.45)
    f = 180 + 520 * (1 - np.exp(-x * 9)) + 25 * np.sin(2 * np.pi * 14 * x)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.003, 0.25)
    mix_at(buf, 0.8 * s, 0.0)
    run = [67, 71, 74, 79, 83, 86, 91]
    for k, n in enumerate(run):
        mix_at(buf, 0.5 * bell(midi(n), 0.5, 0.18), 0.35 + k * 0.065)
    mix_at(buf, 0.6 * brass_chord([midi(n) for n in (67, 71, 74, 79)], 1.1, 3200), 0.85)
    mix_at(buf, 0.35 * crash(1.4), 0.85)
    mix_at(buf, 0.6 * kick(), 0.85)
    return norm(buf)


def drumroll():
    # 3.4s snare roll crescendo, then kick + crash.
    d = 5.2
    buf = np.zeros(int(SR * d))
    roll = 3.4
    k = 0
    at = 0.0
    while at < roll:
        g = 0.15 + 0.85 * (at / roll) ** 1.5
        mix_at(buf, g * snare(0.08, 0.025) * rng.uniform(0.8, 1.0), at)
        at += 0.034 + rng.uniform(-0.003, 0.003)
        k += 1
    mix_at(buf, kick(0.6), roll)
    mix_at(buf, 0.8 * crash(1.8), roll)
    mix_at(buf, 0.6 * brass_chord([midi(n) for n in (62, 66, 69, 74)], 1.6, 3000), roll)
    return norm(buf)


def applause():
    # ~6s crowd: hundreds of short claps (band-passed noise bursts) + cheer wash.
    d = 6.5
    buf = np.zeros(int(SR * d))
    claps = 1400
    for _ in range(claps):
        at = rng.uniform(0, d - 0.1)
        dens = min(1.0, at / 0.6) * (1.0 if at < d - 2 else max(0.0, (d - at) / 2))
        if rng.uniform() > dens:
            continue
        cd = 0.03
        c = noise(cd)
        c = highpass(lowpass(c, rng.uniform(1800, 3500)), rng.uniform(600, 1100))
        c *= env(len(c), 0.0005, 0.008) * rng.uniform(0.4, 1.0)
        mix_at(buf, c, at)
    wash = lowpass(highpass(noise(d), 300), 2500)
    shape = np.minimum(1, t(d) / 0.8) * np.clip((d - t(d)) / 2.5, 0, 1)
    buf += 0.12 * wash * shape
    return norm(buf, 0.8)


def button():
    d = 0.12
    x = t(d)
    f = 900 + 700 * np.exp(-x * 60)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 0.025)
    s += 0.25 * highpass(noise(d), 4000) * env(len(x), 0.0005, 0.004)
    return norm(s, 0.7)


SLOTS = {
    "sfx_theme_sting": theme_sting,
    "sfx_bed_question": bed_question,
    "sfx_tick": tick,
    "sfx_correct": correct,
    "sfx_wrong": wrong,
    "sfx_timeout": timeout,
    "sfx_aiden_sting": aiden_sting,
    "sfx_drumroll": drumroll,
    "sfx_applause": applause,
    "sfx_button": button,
}


def write_wav(path, data):
    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    stereo = np.repeat(pcm[:, None], 2, axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    for slot, fn in SLOTS.items():
        write_wav(out / f"{slot}.wav", fn())
        print(slot)
