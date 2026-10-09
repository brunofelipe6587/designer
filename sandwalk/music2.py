# V2 soundtrack: light tropical/acoustic groove (synthesized from scratch, safe for paid media) + narration.
# Narration lines (build/vo/l*.wav, pt-BR-ThalitaMultilingualNeural) are placed at VO_AT and the bed ducks under them.
# Usage: python3 music2.py build/mix2.wav
import numpy as np, json, sys
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
DUR = 24.0
N = int(SR * DUR)
BPM = 102
BEAT = 60 / BPM
rng = np.random.default_rng(11)
VO_AT = [0.15, 2.55, 5.2, 10.55, 16.3, 20.85]
VO_FILES = [f'build/vo/l{i}.wav' for i in range(1, 7)]
L = np.zeros(N); R = np.zeros(N)


def t_(d): return np.arange(int(SR * d)) / SR


def filt(x, kind, f, order=2):
    f = [v / (SR / 2) for v in f] if isinstance(f, (list, tuple)) else f / (SR / 2)
    return sosfilt(butter(order, f, kind, output='sos'), x)


def add(sig, at, gain=1.0, pan=0.0, buf=None):
    i = int(at * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i]
    (L if buf is None else buf[0])[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    (R if buf is None else buf[1])[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


def kick():
    t = t_(0.28); f = 48 + 60 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * 0.8


def snap():
    t = t_(0.12)
    n = filt(rng.standard_normal(len(t)), 'bandpass', [1800, 6000]) * np.exp(-t * 55)
    return (n + np.sin(2 * np.pi * 330 * t) * np.exp(-t * 60) * 0.3) * 0.5


def shaker(acc):
    t = t_(0.07)
    env = np.minimum(1, t / 0.012) * np.exp(-t * 60)
    return filt(rng.standard_normal(len(t)), 'bandpass', [5000, 11000]) * env * (0.32 if acc else 0.18)


def marimba(f, d=0.7):
    t = t_(d)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.35 * np.sin(2 * np.pi * f * 3.99 * t) * np.exp(-t * 22) \
        + 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 45)
    return s * np.minimum(1, t / 0.002) * 0.35


def bass(f, d):
    t = t_(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return filt(s, 'lowpass', 400) * np.minimum(1, t / 0.01) * np.exp(-t * 2.5) * 0.5


def pad(freqs, d):
    t = t_(d)
    s = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) + 0.4 * np.sin(2 * np.pi * f * 1.003 * t) for f in freqs) / len(freqs)
    return filt(s, 'lowpass', 1400) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6) * 0.16


def whoosh(d=0.5):
    t = t_(d); x = rng.standard_normal(len(t)); out = np.zeros(len(t)); seg = 512
    for s in range(0, len(t), seg):
        p = s / len(t); fc = 600 + 4000 * np.sin(np.pi * p)
        out[s:s + seg] = filt(x[max(0, s - 2048):s + seg], 'bandpass', [fc * 0.6, fc * 1.5])[-len(x[s:s + seg]):]
    return out * np.sin(np.pi * t / d) ** 2 * 0.35


def chime(f):
    t = t_(1.2)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 4) * 0.25


# A major, I–V–vi–IV, one bar each
A3, Cs4, E4, Fs4, Gs3, B3, D4 = 220.0, 277.18, 329.63, 369.99, 207.65, 246.94, 293.66
CHORDS = [([A3, Cs4, E4], 55.0), ([Gs3, B3, E4], 41.2), ([A3, Cs4, Fs4], 46.25), ([A3, D4, Fs4], 36.71)]
ARP = [0, 1, 2, 1, 2, 0, 1, 2]  # 8th-note marimba pattern per bar
bars = int(DUR / (4 * BEAT)) + 1
for b in range(bars):
    b0 = b * 4 * BEAT
    notes, root = CHORDS[b % 4]
    add(pad([n / 2 for n in notes], 4 * BEAT + 0.3), b0, 1.0)
    for k, idx in enumerate(ARP):
        oct_ = 2 if (k in (2, 4) and b % 2) else 1
        add(marimba(notes[idx] * oct_), b0 + k * BEAT / 2, 0.55 if k % 2 == 0 else 0.4, pan=(-0.35 if k % 2 else 0.35))
    add(bass(root * 2, 1.2), b0, 1.0); add(bass(root * 2, 0.5), b0 + 1.5 * BEAT, 0.7); add(bass(root * 3, 0.5), b0 + 3 * BEAT, 0.6)
    for beat in range(4):
        at = b0 + beat * BEAT
        if b0 >= 0.0:
            if beat in (0, 2): add(kick(), at, 0.65)
            if beat in (1, 3): add(snap(), at, 0.5, pan=0.1)
        for s in range(4):
            add(shaker(s % 2 == 0), at + s * BEAT / 4, 1.0, pan=0.4)

# transitions + UI accents
for at in (4.85, 10.3, 16.05, 20.6):
    add(whoosh(0.5), at, 1.0)
for at, f in ((5.2, 880), (10.55, 988), (16.3, 1108.7), (20.85, 1318.5)):
    add(chime(f), at, 0.6)

bed = np.stack([L, R], 1)
bed /= np.max(np.abs(bed)) + 1e-9

# narration track + ducking envelope
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
duck = np.where(act, 10 ** (-11 / 20), 1.0)
k = int(0.12 * SR); duck = np.convolve(np.pad(duck, (k, k), mode='edge'), np.ones(k) / k, 'same')[k:-k]

mix = bed * duck[:, None] * 0.42 + vo[:, None] * 0.9
fade = int(0.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 10 ** (-1.0 / 20)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'build/mix2.wav', SR, (mix * 32767).astype(np.int16))
bedonly = bed * 0.42; bedonly[-fade:] *= np.linspace(1, 0, fade)[:, None]
wavfile.write('build/bed2.wav', SR, (bedonly / (np.max(np.abs(bedonly)) + 1e-9) * 0.89 * 32767).astype(np.int16))
print('ok')
