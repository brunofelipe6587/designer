# Builds audio/mix.wav: the re-ordered voice (same SEGS table as video.html) + light SFX
# (boom on the hook, whooshes on the jump cuts, pops on the cards, swell into the end card).
# Usage: python3 build_audio.py  ->  audio/mix.wav  (then mux with the silent render)
import subprocess, wave, numpy as np, os

SR, DUR, END = 48000, 24.8, 22.84
SRC = 'raw/insumo_IMG_5888.mp4'
SEGS = [(0.00, 13.50, 19.50), (6.00, 0.97, 4.30), (9.33, 4.39, 12.86), (17.80, 19.48, 21.78), (20.10, 22.64, 25.36)]
os.makedirs('audio', exist_ok=True)

subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', SRC, '-ac', '1', '-ar', str(SR), 'audio/src.wav'], check=True)
wf = wave.open('audio/src.wav'); src = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768

voice = np.zeros(int(DUR * SR), np.float32)
fade = int(0.006 * SR)  # short: the D2 join sits right after the tail of "antecipada"
for o, a, b in SEGS:
    seg = src[int(a * SR):int(b * SR)].copy()
    ramp = np.linspace(0, 1, fade, dtype=np.float32)
    seg[:fade] *= ramp; seg[-fade:] *= ramp[::-1]
    i = int(o * SR); voice[i:i + len(seg)] += seg

t = np.arange(int(DUR * SR)) / SR
sfx = np.zeros_like(voice)
rng = np.random.default_rng(7)

def boom(at, gain):
    n = int(0.9 * SR); x = np.arange(n) / SR
    f = 38 + 70 * np.exp(-x * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 4.5)
    s += 0.25 * rng.standard_normal(n) * np.exp(-x * 40)
    i = int(at * SR); sfx[i:i + n] += gain * s[:len(sfx) - i]

def whoosh(at, gain, dur=0.32):
    n = int(dur * SR); x = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    # band-limited by a moving one-pole low-pass: cutoff sweeps up then down
    cut = 0.05 + 0.35 * np.sin(np.pi * x) ** 2
    y = np.zeros(n); acc = 0.0
    for k in range(n):
        acc += cut[k] * (noise[k] - acc); y[k] = acc
    y *= np.sin(np.pi * x) ** 1.5
    i = int((at - dur * 0.6) * SR); i = max(i, 0)
    sfx[i:i + n] += gain * y[:len(sfx) - i] / (np.abs(y).max() + 1e-9)

def pop(at, gain):
    n = int(0.12 * SR); x = np.arange(n) / SR
    s = np.sin(2 * np.pi * (900 - 2500 * x) * x) * np.exp(-x * 45)
    i = int(at * SR); sfx[i:i + n] += gain * s

def swell(a, b, gain):
    i0, i1 = int(a * SR), int(b * SR); x = np.linspace(0, 1, i1 - i0)
    noise = rng.standard_normal(i1 - i0)
    y = np.convolve(noise, np.ones(40) / 40, mode='same') * x ** 2
    sfx[i0:i1] += gain * y / (np.abs(y).max() + 1e-9)

boom(0.0, 0.55)
boom(2.96, 0.22)                      # "até 50%"
for c in (6.00, 9.33, 17.80, 20.10):  # segment jump cuts
    whoosh(c, 0.16)
for p in (10.33, 13.09, 15.25, 20.43):  # group card, checklist items, CTA
    pop(p, 0.10)
swell(END - 0.9, END, 0.14)
boom(END, 0.45)

mix = voice + sfx
mix /= max(1.0, np.abs(mix).max() / 0.95)
fin = int(0.4 * SR); mix[-fin:] *= np.linspace(1, 0, fin)
with wave.open('audio/mix_raw.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'audio/mix_raw.wav',
                '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-14:TP=-1.5:LRA=9',
                '-ar', str(SR), '-ac', '2', 'audio/mix.wav'], check=True)
print('audio/mix.wav', DUR, 's')
