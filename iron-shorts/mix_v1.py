# Mixes V1 audio: presenter voice (re-cut client audio) + SFX cues synced to videoV1.html, then
# muxes with out/videoV1_silent.mp4 and loudness-normalizes to -14 LUFS (Meta/Reels).
# SFX: Adobe Stock free licenses (audio/whoosh.wav, audio/whoosh_hit.wav, audio/cash.wav); pop is synthesized.
import subprocess, numpy as np, os
D = os.path.dirname(os.path.abspath(__file__)); SR = 48000; DUR = 35.4

def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768

voice = load(f'{D}/ugc/raw/v1_cut.mp4')
whoosh, hit, cash = load(f'{D}/audio/whoosh.wav'), load(f'{D}/audio/whoosh_hit.wav'), load(f'{D}/audio/cash.wav')
cash = cash / np.abs(cash).max() * 0.9
t = np.arange(int(0.09 * SR)) / SR
pop = np.sin(2 * np.pi * (900 * t - 3300 * t * t)) * np.exp(-t * 45)

mix = np.zeros(int(DUR * SR) + SR, dtype=np.float32)
mix[:len(voice)] += voice
def put(snd, at, vol, offset=0.0):
    s = snd[int(offset * SR):] * vol; i = int(at * SR)
    if i < 0: s, i = s[-i:], 0
    n = min(len(s), len(mix) - i); mix[i:i + n] += s[:n]

put(hit, 0.0, 0.45, offset=1.55)                      # hook impact
for e in [2.6, 7.0, 7.72, 14.9, 16.3, 19.92, 22.55, 24.2, 27.15, 27.85]:
    put(whoosh, e - 0.5, 0.32)                         # card / cut swooshes (peak ~0.55 s into file)
for e in [7.95, 8.07, 8.19, 8.31, 8.43]: put(pop, e, 0.18)
for e in [16.85, 17.05, 17.25, 30.6, 30.78, 30.96, 31.2]: put(pop, e, 0.3)
put(hit, 10.36 - 1.65, 0.28)                          # "fabricação própria" stamp
put(cash, 18.95, 0.55)                                 # KIT price
put(hit, 29.85 - 1.65, 0.38)                           # end card
mix = mix[:int(DUR * SR)]
mix = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', f'{D}/build/v1_mix.wav'], input=mix.tobytes(), check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/out/videoV1_silent.mp4', '-i', f'{D}/build/v1_mix.wav',
                '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', '-ac', '2', '-c:v', 'libx264', '-crf', '19', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                '-shortest', '-movflags', '+faststart', f'{D}/out/IronShorts_9x16_V1_Apresentador_Kit165.mp4'], check=True)
print('ok')
