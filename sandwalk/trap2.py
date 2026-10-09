# V2 soundtrack, trap version (replaces the tropical bed of music2.py; same narration and ducking).
# Synthesized from scratch (no samples) so it is safe for paid media. 131 BPM in half-time, F minor.
# The bar grid puts downbeats on the two big cuts of video2.html (5.0 kit reveal, 10.5 price);
# the other cuts (1.25, 2.45, 3.6, 16.2, 18.0, 19.3, 20.7) get their own hits/sweeps.
# Usage: python3 trap2.py build/mix2_trap.wav
import numpy as np, sys
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
DUR = 24.0
N = int(SR * DUR)
BPM = 131
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
ORIGIN = 5.0 - 3 * BAR          # downbeat grid: 5.0 and 10.5 (= 5.0 + 3 bars) are bar lines
rng = np.random.default_rng(23)
VO_AT = [0.15, 2.55, 5.2, 10.55, 16.3, 20.85]
VO_FILES = [f'build/vo/l{i}.wav' for i in range(1, 7)]
L = np.zeros(N); R = np.zeros(N)


def t_(d): return np.arange(int(SR * d)) / SR


def filt(x, kind, f, order=2):
    f = [v / (SR / 2) for v in f] if isinstance(f, (list, tuple)) else f / (SR / 2)
    return sosfilt(butter(order, f, kind, output='sos'), x)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


def kick():
    t = t_(0.32); f = 45 + 130 * np.exp(-t * 35)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    s += filt(rng.standard_normal(len(t)), 'highpass', 3000) * np.exp(-t * 250) * 0.4
    return np.tanh(s * 2.2) * 0.85


def clap():
    t = t_(0.35); env = np.zeros(len(t))
    for k, o in enumerate([0, 0.009, 0.019, 0.03]):
        i = int(o * SR); env[i:] += np.exp(-t[: len(t) - i] * (110 if k < 3 else 13))
    n = filt(rng.standard_normal(len(t)), 'bandpass', [1000, 6500]) * env
    body = np.sin(2 * np.pi * 200 * t) * np.exp(-t * 35) * 0.35
    return (n + body) * 0.75


def hat(open_=False):
    t = t_(0.25 if open_ else 0.045)
    return filt(rng.standard_normal(len(t)), 'highpass', 8000) * np.exp(-t * (16 if open_ else 95)) * 0.5


def b808(freq, d, glide_to=None, glide_at=0.75):
    t = t_(d)
    f = np.full(len(t), freq)
    if glide_to:
        g0 = int(glide_at * len(t)); ramp = np.linspace(0, 1, len(t) - g0) ** 0.6
        f[g0:] = freq * (glide_to / freq) ** ramp
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 0.9) * np.minimum(1, (d - t) / 0.03)
    click = np.sin(2 * np.pi * np.cumsum(f * 3 + 300 * np.exp(-t * 60)) / SR) * np.exp(-t * 45) * 0.25
    return np.tanh((s * env + click) * 2.6) * 0.7   # saturation gives harmonics that phones can play


def bell(freq, d=1.0):
    t = t_(d)
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * 2.2 * np.exp(-t * 5)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 3.2)
    return s * np.minimum(1, t / 0.003) * 0.28


def pad(freqs, d):
    t = t_(d)
    s = sum(np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.006 * t + 1) for f in freqs) / len(freqs)
    return filt(s, 'lowpass', 900) * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5) * 0.2


def noise_sweep(d, up=True, gain=0.5):
    t = t_(d); x = rng.standard_normal(len(t)); out = np.zeros(len(t)); seg = 512
    for s in range(0, len(t), seg):
        p = s / len(t); fc = (300 + 7000 * p ** 2) if up else (6000 - 5500 * p)
        out[s:s + seg] = filt(x[max(0, s - 2048):s + seg], 'bandpass', [fc * 0.6, min(fc * 1.6, 20000)])[-len(x[s:s + seg]):]
    env = (t / d) ** 2 if up else np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return out * env * gain


def impact(gain=1.0):
    t = t_(1.6); f = 35 + 100 * np.exp(-t * 14)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    n = filt(rng.standard_normal(len(t)), 'lowpass', 2500) * np.exp(-t * 7) * 0.45
    return np.tanh((s + n) * 1.8) * gain


def rev_cymbal(d=0.9):
    t = t_(d)
    return filt(rng.standard_normal(len(t)), 'highpass', 5000) * (t / d) ** 3 * 0.5


# F minor: Fm – Db – Ab – Eb (808 roots around 35–52 Hz, bells in the 4th/5th octave)
F1, Db1, Ab1, Eb1 = 43.65, 34.65, 51.91, 38.89
PROG = [(F1, [349.23, 415.30, 523.25]), (Db1, [277.18, 349.23, 415.30]), (Ab1, [311.13, 415.30, 523.25]), (Eb1, [311.13, 392.0, 466.16])]
MEL = [523.25, 0, 415.30, 466.16, 0, 415.30, 349.23, 0]   # 8th-note bell motif (0 = rest)

KICK_STEPS = [0, 10]          # half-time trap kick
KICK_FILL = [0, 7, 10]
CLAP_STEP = 8                 # snare on beat 3 (half-time)
STOP = (10.5 - 0.42, 10.5)    # beat cut right before the price section
END = 23.3

nbars = int((DUR - ORIGIN) / BAR) + 1
for b in range(nbars):
    b0 = ORIGIN + b * BAR
    root, chord = PROG[b % 4]
    intro = b0 < 5.0 - 1e-6                   # bars before the kit reveal: lighter (no claps on the first bar)
    add(pad(chord, BAR + 0.3), b0, 0.9 if not intro else 0.7)
    # bell motif: full after the reveal, sparse in the intro
    for k, f in enumerate(MEL):
        if f and (not intro or k % 2 == 0):
            add(bell(f * (2 if b % 2 and k == 3 else 1)), b0 + k * 2 * S16, 0.55 if not intro else 0.45, pan=(-0.3 if k % 2 else 0.3))
    for st in range(16):
        at = b0 + st * S16
        if at < 0 or at >= END: continue
        if STOP[0] <= at < STOP[1]: continue
        kicks = KICK_FILL if b % 2 else KICK_STEPS
        if st in kicks: add(kick(), at, 0.9)
        if st == CLAP_STEP and not (intro and b0 < 0): add(clap(), at, 0.75)
        # 808 follows the kick: long note on the 1, short on the others, glide into the next bar on odd bars
        if st == 0:
            nxt = PROG[(b + 1) % 4][0]
            add(b808(root, BAR * 0.62, glide_to=nxt if b % 2 else None), at, 0.95)
        elif st in (7, 10) and st in kicks:
            add(b808(root * (1.5 if st == 7 else 1), 0.3), at, 0.75)
        # hats: 8ths, 16ths in the second half of the bar after the reveal, a 1/32 roll at the end of odd bars
        if st % 2 == 0: add(hat(), at, 0.32 if st % 4 else 0.24, pan=0.3)
        elif not intro and st >= 8: add(hat(), at, 0.2, pan=0.3)
        if b % 2 and st == 14 and not intro:
            for r in range(4): add(hat(), at + r * S16 / 2, 0.16 + 0.04 * r, pan=0.3)
        if st == 6 and not intro: add(hat(open_=True), at, 0.14, pan=-0.3)

# transitions locked to the video cuts
add(impact(0.9), 0.0)                                    # hook on frame 1
for c in (1.25, 2.45, 3.6, 18.0, 19.3):                  # small cuts: downward sweep
    add(noise_sweep(0.35, up=False, gain=0.35), c - 0.12)
add(noise_sweep(1.6, up=True, gain=0.45), 5.0 - 1.6)    # riser into the kit reveal
add(rev_cymbal(0.9), 5.0 - 0.9, 0.9)
add(impact(1.0), 5.0)
add(noise_sweep(0.42, up=True, gain=0.5), STOP[0])       # beat cut → price drop
add(impact(1.0), 10.5)
add(rev_cymbal(0.7), 16.2 - 0.7, 0.8); add(impact(0.7), 16.2)
add(rev_cymbal(0.7), 20.7 - 0.7, 0.8); add(impact(0.85), 20.7)
add(b808(F1, 1.4), END, 0.95); add(impact(0.8), END)      # final hit

bed = np.stack([L, R], 1)
bed = filt(bed.T, 'highpass', 25).T
bed /= np.max(np.abs(bed)) + 1e-9
bed = np.tanh(bed * 1.5) / np.tanh(1.5)

# narration + ducking (same as music2.py)
vo = np.zeros(N)
for f, at in zip(VO_FILES, VO_AT):
    sr, x = wavfile.read(f)
    x = x.astype(np.float64) / 32768 if x.dtype == np.int16 else x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    assert sr == SR, (f, sr)
    i = int(at * SR); vo[i:i + len(x)] += x[: N - i]
vo = filt(vo, 'highpass', 90)
vo /= np.max(np.abs(vo)) + 1e-9
act = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same') > 0.01
duck = np.where(act, 10 ** (-10 / 20), 1.0)
k = int(0.1 * SR); duck = np.convolve(np.pad(duck, (k, k), mode='edge'), np.ones(k) / k, 'same')[k:-k]
# the voice sits in the mids; carve a little room there in the bed while it talks
mids = filt(bed.T, 'bandpass', [900, 3500]).T
bed_d = bed - mids * (1 - duck[:, None]) * 0.5

mix = bed_d * duck[:, None] * 0.5 + vo[:, None] * 0.9
fade = int(0.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 10 ** (-1.0 / 20)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'build/mix2_trap.wav', SR, (mix * 32767).astype(np.int16))
print('ok')
