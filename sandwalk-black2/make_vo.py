# Builds a voiceover (copied from sandwalk-black/ads): one TTS clip per line (tts.py, pt-BR-AntonioNeural), trimmed of edge silence and
# placed back to back with short gaps. Usage: python3 make_vo.py void2
# Writes audio/vo_<v>.wav and build/vo_<v>.js (line + word timings).
import json, subprocess, sys
V = sys.argv[1]
# Black Sand Walk semana 2 (kits femininos, 15% OFF): female voices — Thalita (multilingual) and Francisca.
SCRIPTS = {
 'f1': ('pt-BR-ThalitaMultilingualNeural', [
    ('hook', 'Os três kits femininos mais vendidos da Sand Walk.'),
    ('n3', 'Em terceiro, o Ever Flame.'),
    ('n2', 'Em segundo, o Void.'),
    ('n1', 'E o campeão: Blackout!'),
    ('offer', 'Na Black, todos os kits femininos estão com quinze por cento off.'),
    ('cta', 'Só até domingo, dia quinze.')]),
 'f2': ('pt-BR-ThalitaMultilingualNeural', [
    ('hook', 'Para tudo: a Black Sand Walk chegou pra elas!'),
    ('offer', 'Quinze por cento off nos kits femininos.'),
    ('pieces', 'Manga longa, manga curta e shorts, por cento e sessenta e um e vinte e cinco.'),
    ('cta', 'Corre, que é só até dia quinze!')]),
 'f3': ('pt-BR-ThalitaMultilingualNeural', [
    ('hook', 'Outfit check da areia!'),
    ('i1', 'Manga longa.'),
    ('i2', 'Manga curta.'),
    ('i3', 'Shorts.'),
    ('i4', 'E quinze por cento off na Black Sand Walk.'),
    ('cta', 'Kit completo por cento e sessenta e um e vinte e cinco. Toca no botão!')]),
 'f4': ('pt-BR-FranciscaNeural', [
    ('hook', 'Quanto custa um kit feminino completo da Sand Walk?'),
    ('old', 'Era cento e oitenta e nove e setenta.'),
    ('new', 'Na Black, sai por cento e sessenta e um e vinte e cinco.'),
    ('per', 'Dá cinquenta e três e setenta e cinco por peça.'),
    ('cta', 'Só até domingo, dia quinze.')]),
 'f5': ('pt-BR-ThalitaMultilingualNeural', [
    ('hook', 'Qual estampa é a sua cara?'),
    ('list', 'Blackout, Void, Ever Flame, Egypt, Rhythm, Vivid...'),
    ('offer', 'Todos os kits femininos com quinze por cento off.'),
    ('cta', 'Escolhe o seu no site, até domingo.')]),
 'f6': ('pt-BR-ThalitaMultilingualNeural', [
    ('hook', 'Feito pra quem joga de verdade.'),
    ('b1', 'Tecido leve, que respira e seca rápido.'),
    ('b2', 'Caimento que valoriza o corpo e acompanha cada movimento.'),
    ('b3', 'Três peças, pra usar juntas ou separadas.'),
    ('offer', 'E na Black: quinze por cento off. Só até domingo!')]),
 'f7': ('pt-BR-FranciscaNeural', [
    ('hook', 'Atenção: são só sete dias!'),
    ('offer', 'De nove a quinze de novembro, os kits femininos da Sand Walk estão com quinze por cento off.'),
    ('price', 'Kit completo por cento e sessenta e um e vinte e cinco.'),
    ('cta', 'Depois de domingo, volta ao preço normal.')]),
}
VOICE, LINES = SCRIPTS[V]
import os; os.environ['VOICE'] = VOICE
GAP, RATE, T0 = 0.28, '+8%', 0.45
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
