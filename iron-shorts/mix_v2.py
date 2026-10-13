# Mixes V2 audio: Power Beat 2 (Adobe Stock, free license) re-arranged on the bar grid to 22.1 s,
# the real handling sound of the stacking clips, and SFX synced to videoV2.html; muxes with out/videoV2_silent.mp4
# and normalizes to -14 LUFS.
import subprocess, numpy as np, os
D = os.path.dirname(os.path.abspath(__file__)); SR = 48000
BEAT = 0.63125; BAR = BEAT * 4; DUR = 22.135; M0 = 0.59  # first downbeat in the track
T = lambda bar, beat=0: bar * BAR + beat * BEAT

def load(p, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', str(ss)] if ss is not None else []) + ['-i', p] + (['-t', str(t)] if t else []) + ['-ac', '2', '-ar', str(SR), '-f', 's16le', '-']
    a = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, dtype=np.int16).astype(np.float32) / 32768
    return a.reshape(-1, 2)

music_src = load(f'{D}/audio/music_power.wav')
seg = lambda a, b: music_src[int((M0 + a) * SR):int((M0 + b) * SR)]
# bars 1–7 as recorded, bar 7 repeated under the end card, then the remaining tail (faded)
music = np.concatenate([seg(0, T(7)), seg(T(6), T(7)), seg(T(7), T(7) + (DUR - T(8)) + 0.05)])
n = int(DUR * SR); music = np.pad(music, ((0, max(0, n - len(music))), (0, 0)))[:n]
fade = int(0.6 * SR); music[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = music * 0.55

whoosh, hit, cash = load(f'{D}/audio/whoosh.wav'), load(f'{D}/audio/whoosh_hit.wav'), load(f'{D}/audio/cash.wav')
cash = cash / np.abs(cash).max() * 0.9
tt = np.arange(int(0.09 * SR)) / SR
pop = np.sin(2 * np.pi * (900 * tt - 3300 * tt * tt)) * np.exp(-tt * 45); pop = np.stack([pop, pop], 1)
def put(snd, at, vol, offset=0.0):
    s = snd[int(offset * SR):] * vol; i = int(at * SR)
    if i < 0: s, i = s[-i:], 0
    k = min(len(s), n - i)
    if k > 0: mix[i:i + k] += s[:k]

# real handling sound of the jeans being stacked (shots 1–3)
for at, clip, ss, dur in [(0.0, 'IMG_9041', 0.0, BAR / 2), (T(0, 2), 'IMG_9042', 0.215, BAR / 2), (T(1), 'IMG_9043', 0.09, BAR / 2)]:
    put(load(f'{D}/ugc/raw2/{clip}.mp4', ss, dur), at, 0.9)
put(hit, 0.0, 0.4, offset=1.55)                      # hook impact
for e in [T(0, 3), T(1, 1)]: put(pop, e, 0.35)       # jeans 2 and 3 land
put(hit, T(1, 2) - 1.65, 0.35)                       # KIT FECHADO stamp
for i in range(4, 10): put(whoosh, T(2) + (i - 4) * BAR / 2 - 0.5, 0.18)   # montage cuts
for i in range(3): put(pop, T(5, 0.5 + i * 0.5), 0.3)  # cutouts drop
put(cash, T(5, 2), 0.5)                              # price
for i in range(4): put(whoosh, T(6, i) - 0.5, 0.22)  # benefit rows
put(hit, T(7) - 1.65, 0.35)                          # end card
for i in range(3): put(pop, T(7, 2 + i * 0.5), 0.25)
put(pop, T(7, 4), 0.35)                              # CTA

mix = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', f'{D}/build/v2_mix.wav'], input=mix.tobytes(), check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/out/videoV2_silent.mp4', '-i', f'{D}/build/v2_mix.wav',
                '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', '-c:v', 'libx264', '-crf', '19', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{D}/out/IronShorts_9x16_V2_MonteSeuKit_Metal.mp4'], check=True)
print('ok')
