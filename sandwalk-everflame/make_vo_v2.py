# Builds the V2 voiceover: one TTS clip per line (tts.py, pt-BR-AntonioNeural), trimmed of edge silence and
# placed back to back with short gaps. Writes audio/vo_v2.wav and build/vo_v2.js (line + word timings).
import json, subprocess
LINES = [
    ('hook', 'Três detalhes do kit Ever Flame que você só vê de perto.'),
    ('d1', 'Um, o tecido: leve, respirável e seca rápido.'),
    ('d2', 'Dois, o shorts tem bolso, pro celular ir junto no treino.'),
    ('d3', 'Três, o acabamento: etiqueta Sand Walk, recortes laterais e o logo SW.'),
    ('offer', 'Camisa e shorts por noventa e nove e noventa, no site da Sand Walk.'),
]
GAP, RATE, T0 = 0.28, '+10%', 0.15
t, out, inputs, delays = T0, [], [], []
for key, text in LINES:
    mp3 = f'audio/vo_v2_{key}.mp3'
    subprocess.run(['python3', 'tts.py', text, mp3, RATE], check=True, capture_output=True)
    words = json.load(open(mp3[:-4] + '_words.json'))
    lead = words[0]['t']                       # trim the clip's leading silence
    end = words[-1]['t'] + words[-1]['d']
    wav = mp3[:-4] + '.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(max(0, lead - 0.04)), '-to', str(end + 0.12), '-i', mp3,
                    '-ac', '2', '-ar', '48000', wav], check=True)
    off = t - (lead - 0.04 if lead > 0.04 else 0)
    out.append({'k': key, 's': round(t, 3), 'e': round(t + end - lead, 3),
                'w': [{'w': w['w'], 's': round(w['t'] + off, 3), 'e': round(w['t'] + w['d'] + off, 3)} for w in words]})
    inputs.append(wav); delays.append(int(round(t * 1000)))
    t += end - lead + GAP
total = t - GAP + 0.1
fc = ''.join(f'[{i}]adelay={d}|{d}[a{i}];' for i, d in enumerate(delays)) + ''.join(f'[a{i}]' for i in range(len(inputs))) + \
     f'amix=inputs={len(inputs)}:normalize=0,apad,atrim=0:{total:.2f}[o]'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + sum([['-i', f] for f in inputs], []) + ['-filter_complex', fc, '-map', '[o]', 'audio/vo_v2.wav'], check=True)
open('build/vo_v2.js', 'w').write('const VO = ' + json.dumps(out, ensure_ascii=False) + ';\n')
for l in out: print(f"{l['k']:6} {l['s']:5.2f}-{l['e']:5.2f}  " + ' '.join(w['w'] for w in l['w']))
print('total', round(total, 2))
