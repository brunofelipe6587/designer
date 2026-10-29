# Original tracks for the Black Sand Walk videos, synthesised from scratch with numpy (no samples — free to use in ads).
#   trap140  (v3 contador)   140 bpm, bars of 1.714 s: bars 1–2 dark pad + hats while the price counts down,
#                            drop with boom on bar 3 (half-time snare, sliding 808, hat rolls), offer on bars 7–9.
#   funk130  (v4 montagem)   130 bpm, bars of 1.846 s: Brazilian funk "tamborzão" from the first frame (hook),
#                            brass stabs, bars 7–8 lighter under the offer, boom at the end.
#   tick120  (v5 7 dias)     120 bpm, bars of 2 s: clock tick on every beat, pulsing sub, riser in bar 2,
#                            four-on-the-floor drop on bar 3, offer on bars 7–8, bell at the end.
# Usage: python3 make_beats.py [name ...]  -> audio/<name>.wav (48 kHz stereo)
import numpy as np, wave, sys
SR = 48000
rng = np.random.default_rng(11)

class Mix:
    def __init__(s, dur): s.N = int(dur * SR); s.m = np.zeros((s.N, 2)); s.dur = dur
    def add(s, sig, t, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= s.N or i < 0: return
        j = min(s.N, i + len(sig)); l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        s.m[i:j, 0] += sig[:j - i] * gain * l * 1.41; s.m[i:j, 1] += sig[:j - i] * gain * r * 1.41
    def write(s, path, drive=0.9, peak=0.89, fade=0.3):
        m = np.tanh(s.m * drive); m /= np.abs(m).max() / peak
        f = int(fade * SR); m[-f:] *= np.linspace(1, 0, f)[:, None]
        with wave.open(path, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m * 32767).astype('<i2').tobytes())

def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for k in range(len(x)): s = (1 - a) * x[k] + a * s; y[k] = s
    return y
def hp(x, fc): return x - lp(x, fc)
def T(d): return np.arange(int(SR * d)) / SR

def kick(dec=0.30, f0=170, f1=48, click=0.5):
    t = T(dec * 2.2); f = f1 + (f0 - f1) * np.exp(-t * 30)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec); s[:240] += np.linspace(click, 0, 240) * rng.standard_normal(240) * 0.5
    return s
def bass808(freq, dur=0.6, slide_to=None, drive=2.4):
    t = T(dur); f = np.full_like(t, freq)
    if slide_to: f = freq + (slide_to - freq) * np.clip(t / 0.09, 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(np.sin(ph) * np.exp(-t / (dur * 0.6)) * drive) * 0.8
def snare(dec=0.16, tone=190):
    t = T(0.3); n = hp(rng.standard_normal(len(t)), 1200) * np.exp(-t / dec)
    return n * 0.8 + np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.05) * 0.6
def clap():
    t = T(0.22); x = rng.standard_normal(len(t)); env = np.zeros(len(t))
    for d in (0, 0.011, 0.022): env += (t >= d) * np.exp(-(t - d).clip(0) / 0.012)
    env += (t >= 0.03) * np.exp(-(t - 0.03).clip(0) / 0.09)
    return hp(lp(x, 3200), 900) * env
def hat(open_=False):
    t = T(0.22 if open_ else 0.05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / (0.08 if open_ else 0.014))
def tom(freq, dec=0.18):
    t = T(dec * 2.5); f = freq * (1 + 0.6 * np.exp(-t * 40))
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec) * 1.6)
def boom(dur=1.4):
    t = T(dur); f = 40 + 90 * np.exp(-t * 9)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) * 1.8)
def pad(freqs, dur, fc=1400):
    t = T(dur); s = np.zeros(len(t))
    for f in freqs:
        for d in (-0.004, 0.004): s += 2 * ((t * f * (1 + d)) % 1) - 1
    env = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3).clip(0)
    return lp(s / (2 * len(freqs)), fc) * env
def pluck(freq, dur=0.5):
    t = T(dur); s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2 * t) + 0.2 * np.sin(2 * np.pi * freq * 3.01 * t)
    return s * np.exp(-t / 0.16) * 0.5
def brass(freqs, dur=0.24):
    t = T(dur); s = np.zeros(len(t))
    for f in freqs: s += 2 * ((t * f) % 1) - 1
    return lp(s / len(freqs), 2400) * np.minimum(1, t / 0.01) * np.exp(-t / 0.12)
def riser(dur, top=7000):
    n = int(dur * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n); y = np.zeros(n); s = 0.0
    for k in range(n):
        fc = 300 + top * (k / n) ** 2; a = np.exp(-2 * np.pi * fc / SR); s = (1 - a) * x[k] + a * s; y[k] = s
    return y * (tt / dur) ** 2 * 1.4
def tick(hi=True):
    t = T(0.04); return hp(np.sin(2 * np.pi * (3200 if hi else 2400) * t) + 0.5 * rng.standard_normal(len(t)), 1500) * np.exp(-t / 0.006)
def bell(freq, dur=2.0):
    t = T(dur); return sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / (0.9 / r)) for r, a in ((1, 0.6), (2.76, 0.25), (5.4, 0.12)))

def trap140():
    BPM = 140; STEP = 60 / BPM / 4; BAR = STEP * 16; M = Mix(15.6)
    C3, Eb3, G3, Ab2, Bb2, D3, F3 = 130.8, 155.6, 196.0, 103.8, 116.5, 146.8, 174.6
    chords = [(C3, Eb3, G3), (Ab2, C3, Eb3), (Bb2, D3, F3), (C3, Eb3, G3)]
    roots = [32.7 * 1.0, 25.96 * 2, 29.14 * 2, 32.7]
    mel = {0: 523.3, 3: 622.3, 6: 784.0, 10: 698.5, 12: 622.3}
    M.add(boom(), 0, 0.6)
    for bar in range(9):
        t0 = bar * BAR; c = chords[bar % 4]
        M.add(pad(c, BAR + 0.05, 900 if bar < 2 else 1600), t0, 0.35)
        for st in range(16):
            t = t0 + st * STEP
            if bar < 2:
                if st % 2 == 0: M.add(hat(), t, 0.18, 0.3)
                if st in mel and bar == 1: M.add(pluck(mel[st]), t, 0.3, -0.3)
                continue
            # hats: 8ths, 16ths, and a 32nd roll at the end of every other bar
            if bar % 2 == 1 and st >= 12:
                M.add(hat(), t, 0.16, 0.3); M.add(hat(), t + STEP / 2, 0.14, 0.3)
            else:
                M.add(hat(), t, 0.15 + 0.08 * (st % 2 == 0), 0.3)
            if st in mel and bar < 7: M.add(pluck(mel[st]), t, 0.36, -0.3)
            if st in (0, 7, 10) or (bar % 2 and st == 14):
                M.add(kick(), t, 0.9)
                r = roots[bar % 4]; M.add(bass808(r * 2, 0.7, slide_to=(r * 2 * 1.5 if st == 10 and bar % 2 else None)), t, 0.6)
            if st == 8: M.add(snare(), t, 0.55); M.add(clap(), t, 0.35)
    M.add(riser(BAR), BAR, 0.45)
    M.add(boom(), 2 * BAR, 0.95)
    M.add(boom(), 15.0 - 0.05, 0.7)
    M.write('audio/trap140.wav'); print('trap140 bar', BAR, 'drop', 2 * BAR)

def funk130():
    BPM = 130; STEP = 60 / BPM / 4; BAR = STEP * 16; M = Mix(15.4)
    stabs = [((392, 494, 587), 0), ((392, 494, 587), 3), ((349, 440, 523), 6), ((392, 494, 587), 10)]
    for bar in range(8):
        t0 = bar * BAR; light = bar >= 6
        for st in range(16):
            t = t0 + st * STEP
            # tamborzão: low drums on 0, 3, 6(ish), 10; snare-tom on 4 and 12; tambourine 16ths
            if st in (0, 3, 10) or (st == 6 and bar % 2 == 0): M.add(tom(78), t, 0.9); M.add(kick(0.22, 120, 50, 0.2), t, 0.6)
            if st in (7, 13) and not light: M.add(tom(160, 0.1), t, 0.45, -0.2)
            if st in (4, 12): M.add(snare(0.12, 230), t, 0.5); M.add(clap(), t, 0.3)
            M.add(hat(), t, 0.10 + 0.07 * (st % 4 == 2), 0.35)
            if not light:
                for ch, s in stabs:
                    if s == st and bar % 2 == (1 if st == 6 else bar % 2): M.add(brass(ch), t, 0.42, -0.2)
            elif st in (0, 10): M.add(brass(stabs[0][0], 0.4), t, 0.3, -0.2)
        M.add(bass808(49.0 if bar % 2 == 0 else 43.65, 0.5), t0, 0.5); M.add(bass808(49.0, 0.4), t0 + 10 * STEP, 0.4)
    M.add(boom(), 8 * BAR - 0.05, 0.85)
    M.write('audio/funk130.wav'); print('funk130 bar', BAR)

def tick120():
    BPM = 120; BEAT = 60 / BPM; STEP = BEAT / 4; BAR = BEAT * 4; M = Mix(16.0)
    for b in range(32):
        t = b * BEAT; bar = b // 4
        M.add(tick(b % 2 == 0), t, 0.5 if bar < 6 else 0.3, 0.2)
        if bar < 2: M.add(bass808(41.2, 0.35, drive=1.6), t, 0.45)
    M.add(riser(BAR, 9000), BAR, 0.5)
    for bar in range(2, 8):
        t0 = bar * BAR
        M.add(pad((220, 261.6, 329.6) if bar % 2 == 0 else (196, 246.9, 293.7), BAR + 0.05, 1200), t0, 0.22)
        for st in range(16):
            t = t0 + st * STEP
            if st % 4 == 0: M.add(kick(0.28, 150, 45), t, 0.9)
            if st % 4 == 2: M.add(bass808(55.0 if bar % 2 == 0 else 49.0, 0.22, drive=2.0), t, 0.5); M.add(hat(True), t, 0.18, 0.3)
            if st in (4, 12): M.add(clap(), t, 0.45)
            if st % 2 == 1: M.add(hat(), t, 0.12, -0.3)
    M.add(boom(), 2 * BAR, 0.9)
    M.add(bell(880), 15.0, 0.5); M.add(bell(1318.5), 15.0, 0.3)
    M.write('audio/tick120.wav'); print('tick120 drop', 2 * BAR)

for name in (sys.argv[1:] or ['trap140', 'funk130', 'tick120']): globals()[name]()
