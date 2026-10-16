# Original track for the Kit Futevôlei Preto creatives: laid-back beach house at 100 bpm, synthesised with numpy
# (no samples, free to use in ads). Bars of 2.4 s:
#   bars 1–2  intro: filtered chords, shaker, soft rim — the product reveal sits on this
#   bars 3–6  groove: four-on-the-floor kick, off-beat bass and hats, open chords
#   bars 7–8  offer: groove continues, last chord rings out to the end
# Writes audio/beat_ftv.wav (48 kHz stereo, 19.2 s).
import numpy as np, wave
SR, BPM = 48000, 100
BEAT = 60 / BPM; STEP = BEAT / 4; BAR = BEAT * 4
DUR = 8 * BAR
N = int(DUR * SR)
mix = np.zeros((N, 2))
rng = np.random.default_rng(11)

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i >= N: return
    if sig.ndim == 1: sig = np.stack([sig * np.sqrt((1 - pan) / 2), sig * np.sqrt((1 + pan) / 2)], 1) * 1.41
    mix[i:j] += sig[:j - i] * gain

def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for k in range(len(x)): s = (1 - a) * x[k] + a * s; y[k] = s
    return y
def hp(x, fc): return x - lp(x, fc)

def kick():
    t = np.arange(int(SR * 0.45)) / SR
    f = 48 + 110 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
def rim():
    t = np.arange(int(SR * 0.08)) / SR
    return (np.sin(2 * np.pi * 1700 * t) * 0.6 + hp(rng.standard_normal(len(t)), 2000) * 0.5) * np.exp(-t / 0.012)
def shaker(acc):
    t = np.arange(int(SR * 0.07)) / SR
    env = np.minimum(1, t / 0.01) * np.exp(-t / 0.025)
    return hp(rng.standard_normal(len(t)), 6000) * env * (1.0 if acc else 0.6)
def ohat():
    t = np.arange(int(SR * 0.16)) / SR
    return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t / 0.05)
def bass(freq, dur):
    t = np.arange(int(SR * dur)) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    return s * np.minimum(1, t / 0.008) * np.exp(-t / (dur * 0.9))
def chord(freqs, dur, cutoff):
    t = np.arange(int(SR * dur)) / SR
    out = np.zeros((len(t), 2))
    for f in freqs:
        for det, ch in ((0.996, 0), (1.004, 1)):
            ph = (f * det * t) % 1.0
            out[:, ch] += (2 * ph - 1)            # detuned saws, one per side
    env = np.minimum(1, t / 0.02) * np.exp(-t / (dur * 0.45))
    for ch in (0, 1): out[:, ch] = lp(lp(out[:, ch], cutoff), cutoff) * env
    return out / len(freqs) * 0.9

def note(n): return 440.0 * 2 ** ((n - 69) / 12)
# Am9 – Fmaj7 – C(add9) – G6, one chord per bar
CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 55, 60, 62, 64], [55, 59, 62, 64]]
ROOTS = [45, 41, 48, 43]

for bar in range(8):
    t0 = bar * BAR; groove = bar >= 2; c = bar % 4
    # chords: short stabs on the "and" of 1 and 3 in the groove, long pads in the intro
    if not groove:
        add(chord([note(n) for n in CHORDS[c]], BAR * 1.05, 900 + 500 * bar), t0, 0.55)
    else:
        for st in (2, 10):
            add(chord([note(n) for n in CHORDS[c]], BEAT * 1.3, 2600), t0 + st * STEP, 0.6)
    for st in range(16):
        t = t0 + st * STEP
        add(shaker(st % 4 == 2), t, 0.16, pan=0.35)
        if st in (4, 12): add(rim(), t, 0.22 if not groove else 0.3, pan=-0.2)
        if groove:
            if st % 4 == 0: add(kick(), t, 0.95)
            if st % 4 == 2:
                add(ohat(), t, 0.2, pan=0.25)
                add(bass(note(ROOTS[c] - 12 + (12 if st == 14 else 0)), BEAT * 0.45), t, 0.75)
# last chord rings to the end
add(chord([note(n) for n in CHORDS[0]], 1.2, 2200), DUR - 1.2, 0.35)
mix = np.tanh(mix * 0.8); mix /= np.abs(mix).max() / 0.89
fade = int(0.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open('audio/beat_ftv.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', round(DUR, 2), 's; groove at', 2 * BAR, 's; offer at', 6 * BAR, 's')
