# Maps the influencer's word timings (build/v05_words.json, source time) onto the V1 edit timeline
# and groups them into short caption chunks. Writes build/caps_v1.js.
import json
W = json.load(open('build/v05_words.json'))
import sys
VARIANT = sys.argv[1] if len(sys.argv) > 1 else 'v1'
# (src_start, src_end, out_start) — must match the audio cuts in prep_<variant>.sh and the timeline in <variant>.html
CUTS_V1B = [(0.00, 0.44, 0.00), (1.00, 3.42, 0.44), (5.80, 8.20, 2.86), (8.88, 9.60, 5.26), (10.40, 11.80, 5.98),
            (13.28, 15.70, 7.38), (18.40, 19.98, 9.80), (20.95, 22.50, 11.38)]
CUTS = [(5.80, 8.20, 0.00), (1.00, 3.18, 2.40), (8.88, 9.60, 4.58), (10.40, 11.80, 5.30), (13.28, 15.70, 6.70), (20.95, 22.51, 9.12)]
CUTS_V1C = [(0.00, 22.50, 0.00)]  # V1c: the whole take, no cuts
CUTS = {'v1b': CUTS_V1B, 'v1c': CUTS_V1C}.get(VARIANT, CUTS)
# whisper misheard "sabe o que que é" (src 9.64–10.14); replaced with what he actually says
PATCH = [('sabe', 9.64, 9.76), ('o', 9.76, 9.84), ('que', 9.84, 9.94), ('que', 9.94, 10.02), ('é?', 10.02, 10.14)]
if VARIANT == 'v1c':
    W = [w for w in W if not (9.6 <= w['s'] < 10.2)] + [{'w': a, 's': b, 'e': c} for a, b, c in PATCH]
    W.sort(key=lambda w: w['s'])
FIX = {'repada': 'rapaz', 'Oh,': 'ó' if VARIANT == 'v1c' else '', 'Walk': 'Walk'}
words = []
for s0, s1, o in CUTS:
    seg = [w for w in W if w['s'] >= s0 - 0.05 and w['e'] <= s1 + 0.05]
    for w in seg:
        t = FIX.get(w['w'], w['w']).strip(' ,.?!')
        if VARIANT in ('v1b', 'v1c'):  # creator-style captions: sentence case, brand name capitalised
            t = {'sand': 'Sand', 'walk': 'Walk'}.get(t.lower(), t.lower())
        else:
            t = t.upper()
        if t: words.append({'p': w['w'].strip()[-1:] in ',.?!' or w['w'] in ('Oh,',), 'w': t, 's': round(w['s'] - s0 + o, 3), 'e': round(w['e'] - s0 + o, 3), 'cut': o})
chunks, cur = [], []
# v1c: captions follow his spoken phrases (word counts per phrase), e.g. "meus filhos falar pra vocês" | "chegou a coleção nova" | ...
GROUPS_V1C = [5, 4, 6, 5, 3, 5, 6, 5, 5, 2, 4, 5, 4, 6, 3, 4]
if VARIANT == 'v1c':
    assert sum(GROUPS_V1C) == len(words), (sum(GROUPS_V1C), len(words), [w['w'] for w in words])
    i = 0
    for n in GROUPS_V1C: chunks.append(words[i:i + n]); i += n
    words = []
for w in words:
    lim = 22 if VARIANT in ('v1b', 'v1c') else 16
    full = sum(len(x['w']) + 1 for x in cur) + len(w['w']) > lim or len(cur) == (5 if VARIANT in ('v1b', 'v1c') else 4)
    glued = cur and cur[-1]['w'].upper() == 'SAND' and w['w'].upper() == 'WALK'   # never split the brand name
    phrase = VARIANT == 'v1c' and cur[-1]['p'] if cur else False   # v1c: one spoken phrase per caption
    if cur and not glued and (full or phrase or w['cut'] != cur[0]['cut'] or w['s'] - cur[-1]['e'] > 0.35):
        chunks.append(cur); cur = []
    cur.append(w)
if cur: chunks.append(cur)
out = []
for i, c in enumerate(chunks):
    nxt = chunks[i + 1][0]['s'] if i + 1 < len(chunks) else c[-1]['e'] + 0.3
    out.append({'s': c[0]['s'], 'e': round(min(nxt, c[-1]['e'] + 0.4), 3), 'w': [{k: v for k, v in x.items() if k != 'p'} for x in c]})
open(f'build/caps_{VARIANT}.js', 'w').write('const CAPS = ' + json.dumps(out, ensure_ascii=False) + ';\n')
for c in out: print(f"{c['s']:5.2f}-{c['e']:5.2f}  " + ' '.join(x['w'] for x in c['w']))
