# Puts the music bed (Mizmo – "Hello, The Sun Is Up, Where Are You?") under the Cardigan Pietro edits.
# Usage: python3 mix_music.py [P1 P2 …]   (no filter = every job)
#  - no narration: music is the only track, from the fuller section (63.75 s), -14 LUFS.
#  - narrated: music from the lighter opening (0.5 s) sits ~7 dB under the voice and ducks further
#    while a line is spoken (sidechain on the voice), so it fills the gaps without competing with the words.
# Silent cuts come from render_video.js (NOTL=1 for the authored 15 s cut, without it for the narrated timing).
import subprocess, sys
from pathlib import Path

ROOT = Path(__file__).parent
MUSIC = ROOT / 'audio' / 'musica_mizmo_hello_the_sun_is_up.mp3'
JOBS = [
    # (video in, voice wav or None, music start s, out)
    ('build/p1_mudo_15s.mp4', None, 63.75, 'out/JustCo_Pietro_9x16_P1_OMaisVendido_musica.mp4'),
    ('build/p2_mudo_15s.mp4', None, 63.75, 'out/JustCo_Pietro_9x16_P2_DiasAmenos_musica.mp4'),
    ('build/p1_narrado_mudo.mp4', 'audio/p1_voz.wav', 0.5, 'out/JustCo_Pietro_9x16_P1_OMaisVendido_narrado.mp4'),
    ('build/p2_narrado_mudo.mp4', 'audio/p2_voz.wav', 0.5, 'out/JustCo_Pietro_9x16_P2_DiasAmenos_narrado.mp4'),
]
ONLY = sys.argv[1:]   # optional filters, e.g. `python3 mix_music.py P1`


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)],
                                capture_output=True, text=True, check=True).stdout)


for vid, voice, start, out in JOBS:
    if ONLY and not any(f in out for f in ONLY):
        continue
    vid, out = ROOT / vid, ROOT / out
    d = dur(vid)
    fade = f'afade=t=in:st=0:d=0.25,afade=t=out:st={d - 1.4:.3f}:d=1.4'
    music = f'[1:a]atrim=start={start}:duration={d:.3f},asetpts=PTS-STARTPTS,aresample=48000,{fade}'
    if voice is None:
        fc = f'{music},loudnorm=I=-14:TP=-1.5:LRA=9,apad,atrim=0:{d:.3f}[a]'
        inputs = ['-i', str(vid), '-ss', '0', '-i', str(MUSIC)]
    else:
        fc = (f'{music},loudnorm=I=-16:TP=-2:LRA=9,volume=-7dB[m];'
              f'[2:a]aresample=48000,asplit=2[v][key];'
              f'[m][key]sidechaincompress=threshold=0.03:ratio=5:attack=15:release=400:makeup=1[duck];'
              f'[v][duck]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5:LRA=9,apad,atrim=0:{d:.3f}[a]')
        inputs = ['-i', str(vid), '-i', str(MUSIC), '-i', str(ROOT / voice)]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart',
                    str(out)], check=True)
    print('ok', out.relative_to(ROOT), f'{d:.2f}s')
