# Original soundtrack for the Sand Walk ad, synthesized from scratch (no samples) so it is safe for paid media.
# 120 BPM, 16th = 0.125 s. Cues are aligned with the cuts in video1.html:
#   0.00 hook impact · 1.20 ball contact hit (slow-mo) · 3.00 drop · 8.00 products · 14.00 sungas · 16.00 end card
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
import sys

SR = 48000
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 20.0
N = int(SR * DUR)
BPM = 120
S16 = 60 / BPM / 4
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)


def t_(d): return np.arange(int(SR * d)) / SR


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


def filt(x, kind, f, order=2):
    if isinstance(f, (list, tuple)): f = [v / (SR / 2) for v in f]
    else: f = f / (SR / 2)
    return sosfilt(butter(order, f, kind, output='sos'), x)


def kick(d=0.42, f0=160, f1=42):
    t = t_(d)
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s += filt(rng.standard_normal(len(t)), 'highpass', 2500) * np.exp(-t * 180) * 0.35
    return np.tanh(s * 1.8) * 0.9


def snare(d=0.22):
    t = t_(d)
    n = filt(rng.standard_normal(len(t)), 'bandpass', [1200, 7000]) * np.exp(-t * 22)
    b = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.6
    return (n * 0.9 + b) * 0.8


def clap(d=0.3):
    t = t_(d)
    env = np.zeros(len(t))
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR); env[i:] += np.exp(-(t[: len(t) - i]) * (90 if k < 2 else 16))
    return filt(rng.standard_normal(len(t)), 'bandpass', [900, 5000]) * env * 0.7


def hat(d=0.05, open_=False):
    t = t_(0.22 if open_ else d)
    return filt(rng.standard_normal(len(t)), 'highpass', 7500) * np.exp(-t * (14 if open_ else 70)) * 0.45


def sub808(freq, d=0.9, glide_from=None):
    t = t_(d)
    f = np.full(len(t), freq) if glide_from is None else freq + (glide_from - freq) * np.exp(-t * 25)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t / 0.005) * np.exp(-t * 2.4)
    return np.tanh(s * env * 2.2) * 0.75


def pluck(freq, d=0.6):
    # Karplus-Strong string
    n = int(SR / freq); buf = rng.uniform(-1, 1, n); out = np.zeros(int(SR * d))
    for i in range(len(out)):
        out[i] = buf[i % n]
        buf[i % n] = 0.5 * (buf[i % n] + buf[(i + 1) % n]) * 0.996
    return filt(out, 'lowpass', 5000) * 0.55


def riser(d, f0=300, f1=6000):
    t = t_(d)
    x = rng.standard_normal(len(t))
    out = np.zeros(len(t)); seg = 1024
    for s in range(0, len(t), seg):
        fc = f0 * (f1 / f0) ** (s / len(t))
        out[s:s + seg] = filt(x[max(0, s - 2048):s + seg], 'bandpass', [fc * 0.7, min(fc * 1.4, 20000)])[-len(x[s:s + seg]):]
    tone = np.sin(2 * np.pi * np.cumsum(200 * (4 ** (t / d))) / SR) * 0.15
    return (out * 0.6 + tone) * (t / d) ** 2


def whoosh(d=0.45, down=True):
    t = t_(d)
    x = rng.standard_normal(len(t)); out = np.zeros(len(t)); seg = 512
    for s in range(0, len(t), seg):
        p = s / len(t); fc = 5000 * (1 - p) + 400 * p if down else 400 * (1 - p) + 5000 * p
        out[s:s + seg] = filt(x[max(0, s - 2048):s + seg], 'bandpass', [fc * 0.6, fc * 1.5])[-len(x[s:s + seg]):]
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return out * env * 0.8


def boom(d=2.2, gain=1.0):
    t = t_(d)
    f = 38 + 90 * np.exp(-t * 12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    n = filt(rng.standard_normal(len(t)), 'lowpass', 1800) * np.exp(-t * 6) * 0.5
    return np.tanh((s + n) * 1.6) * gain


def pad(freqs, d):
    t = t_(d)
    s = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) + 0.5 * np.sin(2 * np.pi * f * 2.005 * t) for f in freqs)
    s = filt(s, 'lowpass', 1800) / len(freqs)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
    return s * env * 0.25


# ---------------- arrangement ----------------
A1, F1, C2, G1 = 55.0, 43.65, 65.41, 49.0
ROOTS = [A1, F1, C2, G1]
PENT = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25]

# hook: impact on frame 1, riser into the ball contact, big hit at 1.00
add(boom(1.6, 0.8), 0.0)
add(kick(), 0.0, 0.9)
HIT = 1.2  # ball contact in the slow-mo
add(riser(HIT, 400, 7000), 0.0, 0.55)
add(boom(2.4, 1.0), HIT)
add(clap(), HIT, 0.8)
add(whoosh(0.5, False), HIT - 0.45, 0.5)
# tension HIT–3.0: pad + sparse plucks, riser into the drop
add(pad([220, 261.63, 329.63], 3.0 - HIT + 0.1), HIT, 0.8)
for k, n in enumerate([440, 392, 329.63, 293.66]):
    add(pluck(n, 0.7), HIT + 0.3 + k * 0.33, 0.5, pan=(-0.3 if k % 2 else 0.3))
add(riser(1.0, 250, 9000), 2.0, 0.6)
add(snare(), 2.5, 0.35); add(snare(), 2.625, 0.4); add(snare(), 2.75, 0.5); add(snare(), 2.875, 0.6)

# drop 3.0 → end: dembow-style groove
KICK = [0, 4, 8, 12]; SNR = [3, 6, 11, 14]
end_beat = DUR - 0.5
for bar in range(int((end_beat - 3.0) / (16 * S16)) + 1):
    b0 = 3.0 + bar * 16 * S16
    root = ROOTS[bar % 4]
    for st in range(16):
        at = b0 + st * S16
        if at >= end_beat: break
        if st in KICK: add(kick(), at, 0.95)
        if st in SNR: add(snare(), at, 0.55, pan=0.05); add(clap(), at, 0.35)
        if st % 2 == 0: add(hat(), at, 0.35 if st % 4 else 0.25, pan=0.35)
        if st % 4 == 2: add(hat(open_=True), at, 0.18, pan=-0.3)
        if st in (0, 6, 10):
            add(sub808(root, 0.6 if st else 0.9, glide_from=root * 1.5 if st == 10 else None), at, 0.85)
    # pluck melody: busier in the product section
    if b0 >= 7.0:
        seq = [0, 2, 4, 3, 5, 4, 2, 1] if bar % 2 == 0 else [0, 2, 4, 5, 6, 4, 3, 2]
        for k, idx in enumerate(seq):
            add(pluck(PENT[idx] * (1 if root != C2 else 1.0), 0.5), b0 + k * 2 * S16, 0.32, pan=(-0.4 if k % 2 else 0.4))
    add(pad([root * 4, root * 4 * 1.2, root * 6], 16 * S16), b0, 0.5)

# transitions
for at in (3.0, 8.0, 14.0, 16.0):
    add(boom(1.2, 0.55), at)
for at in (7.55, 13.6, 15.6):
    add(whoosh(0.45), at, 0.7)
add(riser(1.0, 300, 8000), 7.0, 0.35)
# button pops on the end card
for at in (16.5, 17.0, 17.5, 18.0):
    t = t_(0.08); add(np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 60) * 0.3, at, 0.6)
# final hit + tail
add(boom(2.0, 0.9), end_beat)
add(clap(), end_beat, 0.6)

# master: gentle glue, soft clip, fades
mix = np.stack([L, R], 1)
mix = filt(mix.T, 'highpass', 28).T
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
fade = int(0.35 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix *= 10 ** (-1.0 / 20)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'build/music.wav', SR, (mix * 32767).astype(np.int16))
print('ok', DUR)
