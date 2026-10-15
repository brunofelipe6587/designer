# Builds a voiceover: one TTS clip per line (tts.py, pt-BR-AntonioNeural), trimmed of edge silence and
# placed back to back with short gaps. Usage: python3 make_vo.py void2
# Writes audio/vo_<v>.wav and build/vo_<v>.js (line + word timings).
import json, subprocess, sys
V = sys.argv[1] if len(sys.argv) > 1 else 'void2'
SCRIPTS = {'void2': [
    ('hook', 'Quatro motivos pra jogar de kit Void.'),
    ('m1', 'Um: tecido leve e respirável, que seca rápido.'),
    ('m2', 'Dois: material elástico. Não trava nenhum movimento.'),
    ('m3', 'Três: as cores continuam vivas, mesmo depois de muitas lavagens.'),
    ('m4', 'Quatro: visual de time profissional, até na pelada com os amigos.'),
    ('offer', 'Camisa e shorts por noventa e nove e noventa, no site da Sand Walk.'),
]}
LINES = SCRIPTS[V]
GAP, RATE, T0 = 0.28, '+10%', 0.15
t, out, inputs, delays = T0, [], [], []
for key, text in LINES:
    mp3 = f'audio/vo_{V}_{key}.mp3'
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
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + sum([['-i', f] for f in inputs], []) + ['-filter_complex', fc, '-map', '[o]', f'audio/vo_{V}.wav'], check=True)
open(f'build/vo_{V}.js', 'w').write('const VO = ' + json.dumps(out, ensure_ascii=False) + ';\n')
for l in out: print(f"{l['k']:6} {l['s']:5.2f}-{l['e']:5.2f}  " + ' '.join(w['w'] for w in l['w']))
print('total', round(total, 2))
