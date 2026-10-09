# V2 "Treino" soundtrack using the instrumental intro of "21 Questions" (50 Cent ft. Nate Dogg), src/audio/21_questions.mp3.
# Only the vocal-free 4-bar beat loop (32.86–43.19 s in the music-video audio; bars at 32.86/35.46/38.03/40.61) is used:
#   0–5.0   beat low-passed under the hook, opening up so the bar downbeat 38.03 lands on the kit reveal (5.0)
#   10.1    tape-stop, silence, and the loop restarts on its first downbeat at 10.5 (price)
#   10.5–24 loop continues (seam crossfaded), fade out at the end
# Narration and ducking are the same as music2.py / trap2.py.
# Usage: python3 q21_mix.py build/mix2_q21.wav
import numpy as np, subprocess, sys
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
DUR = 24.0
N = int(SR * DUR)
SONG_OFF = 30.0
L0, L1 = 32.86, 43.19            # vocal-free 4-bar loop
REVEAL, STOP, PRICE = 5.0, 10.1, 10.5
VO_AT = [0.15, 2.55, 5.2, 10.55, 16.3, 20.85]
VO_FILES = [f'build/vo/l{i}.wav' for i in range(1, 7)]

raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(SONG_OFF), '-t', '16', '-i', 'src/audio/21_questions.mp3',
                      '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
song = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float64) / 32768


def S(sec): return int(round((sec - SONG_OFF) * SR))


def filt(x, kind, f, order=2):
    f = [v / (SR / 2) for v in f] if isinstance(f, (list, tuple)) else f / (SR / 2)
    return sosfilt(butter(order, f, kind, output='sos'), x, axis=0)


bed = np.zeros((N, 2))
# A: 0 → STOP, aligned so song 38.03 (a downbeat) plays at REVEAL
a0 = 38.03 - REVEAL
segA = song[S(a0):S(a0) + int(STOP * SR)]
bed[:len(segA)] = segA
# low-pass the hook, opening over the last 0.35 s before the reveal
lp = filt(bed[:int(REVEAL * SR)], 'lowpass', 420, order=4)
t = np.arange(int(REVEAL * SR)) / SR
g = np.clip((t - (REVEAL - 0.35)) / 0.35, 0, 1)[:, None] ** 2
bed[:int(REVEAL * SR)] = lp * (1 - g) * 0.8 + bed[:int(REVEAL * SR)] * g

# tape stop: playback speed falls 1 → 0 over 0.32 s
ts = 0.32
tau = np.arange(int(ts * SR)) / SR
pos = (tau - tau ** 2 / (2 * ts)) * SR                  # integral of speed(τ) = 1 - τ/ts
start = S(a0 + STOP)
idx = start + pos
lo = np.floor(idx).astype(int); fr = (idx - lo)[:, None]
tape = song[lo] * (1 - fr) + song[lo + 1] * fr
tape *= np.linspace(1, 0.2, len(tape))[:, None]
i0 = int(STOP * SR); bed[i0:i0 + len(tape)] = tape
# a few ms fade to avoid clicks at the edges
for edge in (i0,):
    k = int(0.004 * SR); bed[edge - k:edge] *= np.linspace(1, 0.6, k)[:, None]

# B: loop from L0 at PRICE, crossfading the seam
loop = song[S(L0):S(L1)]
xf = int(0.012 * SR)
pos_out = int(PRICE * SR)
while pos_out < N:
    n = min(len(loop), N - pos_out)
    chunk = loop[:n].copy()
    if pos_out > int(PRICE * SR):                        # crossfade with the previous loop's tail
        chunk[:xf] *= np.linspace(0, 1, xf)[:, None]
        bed[pos_out:pos_out + xf] *= np.linspace(1, 0, xf)[:, None]
        bed[pos_out:pos_out + xf] += song[S(L1):S(L1) + xf] * np.linspace(1, 0, xf)[:, None]
    bed[pos_out:pos_out + n] += chunk
    pos_out += n
k = int(0.006 * SR); bed[int(PRICE * SR):int(PRICE * SR) + k] *= np.linspace(0, 1, k)[:, None]

bed /= np.max(np.abs(bed)) + 1e-9

# narration + ducking
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
k = int(0.1 * SR); duck = np.convolve(np.pad(duck, (k, k), mode='edge'), np.ones(k) / k, 'same')[k:-k]
mids = filt(bed, 'bandpass', [900, 3500])
bed_d = bed - mids * (1 - duck[:, None]) * 0.5

mix = bed_d * duck[:, None] * 0.5 + vo[:, None] * 0.9
fade = int(0.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 10 ** (-1.0 / 20)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'build/mix2_q21.wav', SR, (mix * 32767).astype(np.int16))
print('ok')
