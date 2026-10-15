# Maps the influencer's word timings (build/v05_words.json, source time) onto the V1 edit timeline
# and groups them into short caption chunks. Writes build/caps_v1.js.
import json
W = json.load(open('build/v05_words.json'))
# (src_start, src_end, out_start) — must match the audio cuts in prep_v1.sh and the timeline in v1.html
CUTS = [(5.80, 8.20, 0.00), (1.00, 3.18, 2.40), (8.88, 9.60, 4.58), (10.40, 11.80, 5.30), (13.28, 15.70, 6.70), (20.95, 22.51, 9.12)]
FIX = {'repada': 'rapaz', 'Oh,': '', 'Walk': 'Walk'}
words = []
for s0, s1, o in CUTS:
    seg = [w for w in W if w['s'] >= s0 - 0.05 and w['e'] <= s1 + 0.05]
    for w in seg:
        t = FIX.get(w['w'], w['w']).strip(' ,.?!')
        if t: words.append({'w': t.upper(), 's': round(w['s'] - s0 + o, 3), 'e': round(w['e'] - s0 + o, 3), 'cut': o})
chunks, cur = [], []
for w in words:
    full = sum(len(x['w']) + 1 for x in cur) + len(w['w']) > 16 or len(cur) == 4
    glued = cur and cur[-1]['w'] == 'SAND' and w['w'] == 'WALK'   # never split the brand name
    if cur and not glued and (full or w['cut'] != cur[0]['cut'] or w['s'] - cur[-1]['e'] > 0.35):
        chunks.append(cur); cur = []
    cur.append(w)
chunks.append(cur)
out = []
for i, c in enumerate(chunks):
    nxt = chunks[i + 1][0]['s'] if i + 1 < len(chunks) else c[-1]['e'] + 0.3
    out.append({'s': c[0]['s'], 'e': round(min(nxt, c[-1]['e'] + 0.4), 3), 'w': c})
open('build/caps_v1.js', 'w').write('const CAPS = ' + json.dumps(out, ensure_ascii=False) + ';\n')
for c in out: print(f"{c['s']:5.2f}-{c['e']:5.2f}  " + ' '.join(x['w'] for x in c['w']))
