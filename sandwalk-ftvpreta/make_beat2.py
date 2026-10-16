# Original lo-fi track for Kit Futevôlei Preto creative 2: 85 bpm, swung boom-bap drums, electric-piano jazz chords,
# sine bass and vinyl crackle — calm, so the product tour reads at its own pace. Synthesised with numpy (no samples).
# Bars of 60/85*4 = 2.824 s: bar 1 keys + crackle (hook), bars 2–7 full groove, last chord rings into the fade.
# Writes audio/lofi_ftv2.wav (48 kHz stereo).
import numpy as np, wave
SR, BPM = 48000, 85
BEAT = 60 / BPM; BAR = 4 * BEAT; SW = BEAT / 2 * 1.16   # swung 8th (off-beat pushed late)
NB = 7; DUR = NB * BAR
N = int(DUR * SR)
mix = np.zeros((N, 2))
rng = np.random.default_rng(23)

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i >= N or j <= i: return
    if sig.ndim == 1: sig = np.stack([sig * np.sqrt((1 - pan) / 2), sig * np.sqrt((1 + pan) / 2)], 1) * 1.41
    mix[i:j] += sig[:j - i] * gain
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for k in range(len(x)): s = (1 - a) * x[k] + a * s; y[k] = s
    return y
def hp(x, fc): return x - lp(x, fc)
def note(n): return 440.0 * 2 ** ((n - 69) / 12)

def epiano(f, dur):
    t = np.arange(int(SR * dur)) / SR
    idx = 1.6 * np.exp(-t / 0.25)
    s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.1)
    s += 0.15 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.3)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return s * trem * np.minimum(1, t / 0.004)
def chord(ns, dur, strum=0.012):
    n = int(SR * (dur + strum * len(ns))); out = np.zeros(n)
    for k, m in enumerate(ns):
        e = epiano(note(m), dur); i = int(k * strum * SR); out[i:i + len(e)] += e
    return out / len(ns)
def kick():
    t = np.arange(int(SR * 0.4)) / SR
    return np.sin(2 * np.pi * np.cumsum(52 + 80 * np.exp(-t * 30)) / SR) * np.exp(-t / 0.13)
def snare():
    t = np.arange(int(SR * 0.25)) / SR
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05)
    nz = lp(hp(rng.standard_normal(len(t)), 1200), 6000) * np.exp(-t / 0.07)
    return body * 0.5 + nz * 0.8
def hat():
    t = np.arange(int(SR * 0.05)) / SR
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / 0.012)
def bass(f, dur):
    t = np.arange(int(SR * dur)) / SR
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.exp(-t / (dur * 0.8))

# Dm9 – G9 – Cmaj9 – Am9 (ii–V–I–vi)
CH = [[50, 53, 57, 60, 64], [43, 47, 50, 53, 57], [48, 52, 55, 59, 62], [45, 48, 52, 55, 59]]
RT = [38, 31, 36, 33]
for b in range(NB):
    t0 = b * BAR; c = b % 4; groove = b >= 1
    add(chord(CH[c], BAR * 0.62), t0, 0.5, pan=-0.1)
    add(chord(CH[c][1:], BEAT * 1.2), t0 + 2 * BEAT + SW, 0.28, pan=0.15)
    if groove:
        for k in (0, 2 * BEAT + SW): add(kick(), t0 + k, 0.9)
        add(kick(), t0 + 3 * BEAT + SW, 0.5)
        for k in (BEAT, 3 * BEAT): add(snare(), t0 + k, 0.42)
        for q in range(4):
            add(hat(), t0 + q * BEAT, 0.16, pan=0.3); add(hat(), t0 + q * BEAT + SW, 0.1, pan=0.3)
        add(bass(note(RT[c]), BEAT * 1.6), t0, 0.6); add(bass(note(RT[c]), BEAT * 1.2), t0 + 2 * BEAT + SW, 0.45)
# soft low-pass on the whole mix for the lo-fi colour, then crackle and hiss on top
for ch in (0, 1): mix[:, ch] = lp(mix[:, ch], 5200)
crackle = np.zeros(N); pos = rng.integers(0, N, int(DUR * 9)); crackle[pos] = rng.standard_normal(len(pos)) * 0.6
crackle = hp(crackle, 1500) + hp(rng.standard_normal(N), 3000) * 0.006
mix += crackle[:, None] * 0.35
mix = np.tanh(mix * 1.1); mix /= np.abs(mix).max() / 0.89
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open('audio/lofi_ftv2.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', round(DUR, 3), 's; bar', round(BAR, 4))
