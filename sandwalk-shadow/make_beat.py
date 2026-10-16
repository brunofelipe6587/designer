# Original beat for Shadow creative 2 (phonk / Brazilian-funk flavour, 128 bpm), synthesised from scratch with numpy —
# no samples, so it is free to use in ads. Layout (bars of 1.875 s):
#   bars 1–2  intro: melodic cowbell, hats, a noise riser into the drop; a sub "boom" on the first frame
#   bars 3–6  drop: kick + distorted 808, claps on 2 and 4, 16th hats, cowbell melody
#   bars 7–8  outro under the offer: drums + 808, lighter cowbell; final boom at 15.0 s
# Writes audio/beat_shd2.wav (48 kHz stereo).
import numpy as np, wave
SR, BPM = 48000, 128
STEP = 60 / BPM / 4                       # one 16th
BAR = STEP * 16
DUR = 15.6
N = int(DUR * SR)
mix = np.zeros((N, 2))
rng = np.random.default_rng(7)

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i >= N: return
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    mix[i:j, 0] += sig[:j - i] * gain * l * 1.41
    mix[i:j, 1] += sig[:j - i] * gain * r * 1.41

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for k in range(len(x)): s = (1 - a) * x[k] + a * s; y[k] = s
    return y
def hp(x, fc): return x - onepole_lp(x, fc)

def kick(dec=0.32, f0=160, f1=46):
    t = np.arange(int(SR * (dec * 2.2))) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / dec)
    s[:240] += np.linspace(0.6, 0, 240) * rng.standard_normal(240) * 0.5      # click
    return s
def bass808(freq, dur=0.55):
    t = np.arange(int(SR * dur)) / SR
    s = np.sin(2 * np.pi * freq * t + 0.8 * np.sin(2 * np.pi * freq * t)) * np.exp(-t / (dur * 0.55))
    return np.tanh(s * 2.6) * 0.8                                              # saturation -> audible on phones
def clap():
    n = int(SR * 0.22); t = np.arange(n) / SR; x = rng.standard_normal(n)
    env = np.zeros(n)
    for d in (0, 0.011, 0.022): env += (t >= d) * np.exp(-(t - d).clip(0) / 0.012)
    env += (t >= 0.03) * np.exp(-(t - 0.03).clip(0) / 0.09)
    return hp(onepole_lp(x, 3200), 900) * env
def hat(open_=False):
    n = int(SR * (0.22 if open_ else 0.05)); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / (0.08 if open_ else 0.014))
def cowbell(freq, dur=0.22):
    t = np.arange(int(SR * dur)) / SR
    sq = np.sign(np.sin(2 * np.pi * freq * t)) + 0.8 * np.sign(np.sin(2 * np.pi * freq * 1.48 * t))
    return hp(onepole_lp(sq, 2600), 400) * np.exp(-t / 0.07) * 0.5
def boom(dur=1.4):
    t = np.arange(int(SR * dur)) / SR
    f = 40 + 90 * np.exp(-t * 9); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    return np.tanh(s * 1.8)

A5, C6, D6, E5, G5 = 880.0, 1046.5, 1174.7, 659.3, 784.0
MEL = [{0: A5, 3: A5, 6: C6, 8: A5, 10: G5, 11: E5, 14: G5},
       {0: A5, 3: A5, 6: C6, 8: D6, 10: C6, 12: A5, 14: E5}]
ROOT = [55.0, 55.0, 43.65, 49.0]          # A, A, F, G (808)
KICKS = [0, 3, 6, 10]

add(boom(), 0.0, 0.9)
for bar in range(8):
    t0 = bar * BAR
    drop = 2 <= bar <= 5; outro = bar >= 6
    mel = MEL[bar % 2]
    for st in range(16):
        t = t0 + st * STEP
        # hats
        if bar < 2:
            if st % 2 == 0: add(hat(), t, 0.22 + 0.06 * (st % 4 == 0), pan=0.3)
        else:
            if st == 14: add(hat(True), t, 0.25, pan=0.3)
            else: add(hat(), t, 0.18 + 0.1 * (st % 2 == 0), pan=0.3)
        # cowbell melody (filtered/quiet in the intro, full in the drop, sparse in the outro)
        if st in mel and (not outro or st in (0, 6, 8)):
            g = 0.35 if bar < 2 else (0.55 if drop else 0.4)
            add(cowbell(mel[st]), t, g, pan=-0.25)
        if bar >= 2:
            if st in KICKS or (bar % 2 == 1 and st == 14):
                add(kick(), t, 0.95)
                add(bass808(ROOT[bar % 4] * (2 if st == 10 else 1)), t, 0.55)
            if st in (4, 12): add(clap(), t, 0.5)
# riser through bar 2 into the drop
n = int(BAR * SR); tt = np.arange(n) / SR
noise = rng.standard_normal(n); ris = np.zeros(n); s = 0.0
for k in range(n):
    fc = 300 + 7000 * (k / n) ** 2; a = np.exp(-2 * np.pi * fc / SR); s = (1 - a) * noise[k] + a * s; ris[k] = s
add(ris * (tt / BAR) ** 2 * 1.4, BAR, 0.5)
add(boom(), 15.0, 0.9)
# master: gentle saturation + normalise, short fade out
mix = np.tanh(mix * 0.9); mix /= np.abs(mix).max() / 0.89
fade = int(0.25 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open('audio/beat_shd2.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', DUR, 's; drop at', 2 * BAR, 's; outro at', 6 * BAR, 's')
