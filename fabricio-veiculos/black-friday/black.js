// Black Friday Fabrício Veículos: 3 criativos diferentes, cada um em STORIES 9:16 e FEED 4:5.
//   musica  : trecho "só a cama vai ter ressaca" + refrão, cortes e flashes no ritmo, legenda com a oferta
//   voz     : locução de IA apresentando a oferta e cada carro, legenda palavra a palavra, faixa/painel padrão
//   vitrine : grade com os 3 carros e preços logo de cara (feito para assistir sem som), voz curta
// Uso: node black.js [musica|voz|vitrine ...] [--so-stories|--so-feed]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROOT = path.join(__dirname, '..');
const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'campanha.json'), 'utf8'));
const OUT = path.join(ROOT, 'out', 'black-friday');
const TMP = path.join(OUT, '_tmp');
fs.mkdirSync(TMP, { recursive: true });
const FPS = 30;
const SIZE = { stories: [1080, 1920], feed: [1080, 1350] };
const PANEL_X = 312;   // edição padrão do feed: vídeo a partir da borda do painel

const args = process.argv.slice(2);
const which = args.filter((a) => !a.startsWith('--'));
const modes = args.includes('--so-stories') ? ['stories'] : args.includes('--so-feed') ? ['feed'] : ['stories', 'feed'];

const ff = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const probe = (f, e) => execFileSync('ffprobe', ['-v', 'error', ...e, '-of', 'csv=p=0', f]).toString().trim();
const dur = (f) => parseFloat(probe(f, ['-show_entries', 'format=duration']));
const hash = (o) => crypto.createHash('md5').update(JSON.stringify(o)).digest('hex').slice(0, 12);

// dados de cada carro: info.json da pasta (se já existe) + campanha.json
const CARS = C.carros.map((c) => {
  const info = c.pasta ? JSON.parse(fs.readFileSync(path.join(ROOT, 'carros', c.pasta, 'info.json'), 'utf8')) : {};
  const src = c.pasta ? path.join(ROOT, 'carros', c.pasta, 'bruto.mp4') : null;
  return { ...info, ...c, src, pend: !c.valor };
});

// ---------- camadas em PNG (Playwright) ----------
let browser, pages = {};
async function page(mode, file) {
  const k = mode + file;
  if (!pages[k]) {
    const [w, h] = SIZE[mode];
    pages[k] = await browser.newPage({ viewport: { width: w, height: h } });
    await pages[k].goto('file://' + file);
  }
  return pages[k];
}
async function layer(kind, mode, data = {}) {
  const f = path.join(TMP, `L_${kind}_${mode}_${hash(data)}.png`);
  if (fs.existsSync(f)) return f;
  const p = await page(mode, path.join(__dirname, 'black.html'));
  await p.evaluate(([k, m, d]) => window.render(k, m, d), [kind, mode, data]);
  const [w, h] = SIZE[mode];
  await p.screenshot({ path: f, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  return f;
}
// faixa (stories) / painel (feed) da edição validada para um carro
async function faixa(mode, car) {
  const info = {
    localizacao: ['Juazeiro', 'do Norte - CE'], marca: car.marca,
    modelo: car.modelo ?? [car.nome], modelo_stories: car.modelo_stories, ano: car.ano ?? '????', km: car.km,
    valor: car.valor ?? '??.???', centavos: car.centavos ?? '00', entrada: car.entrada, ordem_feed: car.ordem_feed,
  };
  const f = path.join(TMP, `F_${mode}_${hash(info)}.png`);
  if (fs.existsSync(f)) return f;
  const p = await page(mode, path.join(ROOT, 'template', 'faixas.html'));
  await p.evaluate(([m, d]) => window.render(m, d), [mode, info]);
  const [w, h] = SIZE[mode];
  await p.screenshot({ path: f, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  return f;
}

// ---------- vídeo base ----------
// quadro provisório (carro sem vídeo ainda) vira um clipe parado de 20s
async function phClip(car) {
  const f = path.join(TMP, `ph_${car.id}.mp4`);
  if (fs.existsSync(f)) return f;
  const png = await layer('ph', 'stories', { nome: car.nome });
  ff(['-loop', '1', '-framerate', String(FPS), '-t', '20', '-i', png, '-f', 'lavfi', '-t', '20', '-i', 'anullsrc=r=48000:cl=stereo',
    '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-c:a', 'aac', '-shortest', f]);
  return f;
}
// sequência de trechos de um carro até preencher `d` segundos
async function clipsFor(car, d, order = ['frente', 'lateral', 'interior', 'bancos', 'traseira']) {
  if (!car.src) return [{ src: await phClip(car), a: 0, b: d }];
  const out = []; let left = d, i = 0;
  while (left > 0.05) {
    const [a, b] = car.clipes[order[i % order.length]]; i++;
    const take = Math.min(b - a, left);
    out.push({ src: car.src, a, b: a + take }); left -= take;
  }
  return out;
}
// renderiza um trecho no tamanho final (com áudio ambiente), com push-in opcional
function renderSeg(s, mode, k) {
  const [W, H] = SIZE[mode];
  const f = path.join(TMP, `S_${mode}_${k}.mp4`);
  const d = s.b - s.a;
  const vw = s.panel ? W - PANEL_X : W;
  const fit = (w, h) => `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h},setsar=1`;
  let vf;
  if (s.grid) {
    const gy0 = s.gy0 ?? 0, gh = s.gh ?? H, h3 = Math.ceil(gh / s.grid.length / 2) * 2;
    const ins = s.grid.flatMap((g) => ['-ss', String(g.a), '-t', String(d), '-i', g.src]);
    const chains = s.grid.map((_, i) => `[${i}:v]fps=${FPS},${fit(W, h3)}[g${i}]`).join(';');
    ff([...ins, '-filter_complex', `${chains};${s.grid.map((_, i) => `[g${i}]`).join('')}vstack=inputs=${s.grid.length},crop=${W}:${gh},pad=${W}:${H}:0:${gy0}:black,unsharp=5:5:0.6:5:5:0,format=yuv420p[v];[0:a]anull[a]`,
      '-map', '[v]', '-map', '[a]', '-t', String(d), '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-c:a', 'aac', '-ar', '48000', '-ac', '2', f]);
    return f;
  }
  const zoom = s.zoom ? `,zoompan=z='1+${s.zoom}*on/${Math.round(d * FPS)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${vw}x${H}:fps=${FPS}` : '';
  vf = `fps=${FPS},${fit(vw, H)},unsharp=5:5:0.6:5:5:0${zoom}` + (s.panel ? `,pad=${W}:${H}:${PANEL_X}:0:black` : '') + ',format=yuv420p';
  ff(['-ss', String(s.a), '-t', String(d), '-i', s.src, '-vf', vf, '-af', 'aresample=48000', '-ac', '2',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-c:a', 'aac', '-t', String(d), f]);
  return f;
}
function buildBase(segs, mode, name) {
  const files = segs.map((s, i) => renderSeg(s, mode, `${name}_${i}`));
  const list = path.join(TMP, `${name}_${mode}.txt`);
  fs.writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
  const base = path.join(TMP, `base_${name}_${mode}.mp4`);
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', base]);
  return base;
}

// ---------- legenda palavra a palavra (trilha com transparência) ----------
async function captionTrack(words, total, mode, pos) {
  const chunks = []; let cur = [];
  words.forEach((w, i) => {
    cur.push(i);
    const end = /[.,!?]$/.test(w.w) || cur.length === 3 || i === words.length - 1;
    if (end) { chunks.push(cur); cur = []; }
  });
  const events = [];
  for (const ch of chunks) {
    const ws = ch.map((i) => words[i].w.replace(/[.,!?]/g, ''));
    for (const [j, i] of ch.entries()) {
      const st = words[i].t, en = (j < ch.length - 1) ? words[ch[j + 1]].t : words[i].t + words[i].d + 0.15;
      events.push({ st, en, png: await layer('cap', mode, { words: ws, on: j, ...pos }) });
    }
  }
  const blank = await layer('cap', mode, { words: [], on: -1 });
  const lines = []; let t = 0;
  for (const e of events) {
    if (e.st > t + 0.01) lines.push(`file '${blank}'\nduration ${(e.st - t).toFixed(3)}`);
    const s = Math.max(e.st, t);
    lines.push(`file '${e.png}'\nduration ${(e.en - s).toFixed(3)}`); t = e.en;
  }
  lines.push(`file '${blank}'\nduration ${Math.max(0.1, total - t).toFixed(3)}`, `file '${blank}'`);
  const list = path.join(TMP, `cap_${mode}.txt`); fs.writeFileSync(list, lines.join('\n'));
  const mov = path.join(TMP, `cap_${mode}.mov`);
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-vf', `fps=${FPS},format=argb`, '-c:v', 'qtrle', '-t', total.toFixed(3), mov]);
  return mov;
}

// ---------- montagem final ----------
// layers: [{png, st, d, fade, slide:'up'|'left'}]; flashes: [t]; audio: filtro que produz [aout]
function compose({ base, mode, layers, flashes = [], caps, audioInputs = [], audioFilter, out, total }) {
  const [W, H] = SIZE[mode];
  const ins = ['-i', base]; const ch = []; let last = '0:v'; let n = 1; let inputs = 1;
  for (const L of layers) {
    ins.push('-framerate', String(FPS), '-loop', '1', '-t', L.d.toFixed(3), '-i', L.png);
    const fi = L.fade === false ? '' : 'fade=t=in:st=0:d=0.2:alpha=1,';
    const fo = L.keep ? '' : `fade=t=out:st=${Math.max(0, L.d - 0.18).toFixed(3)}:d=0.18:alpha=1,`;
    ch.push(`[${inputs}:v]format=rgba,${fi}${fo}setpts=PTS-STARTPTS+${L.st.toFixed(3)}/TB[l${n}]`); inputs++;
    const st = L.st.toFixed(3);
    const x = L.slide === 'left' ? `'-80*max(0,1-(t-${st})/0.28)'` : '0';
    const y = L.slide === 'up' ? `'70*max(0,1-(t-${st})/0.28)'` : '0';
    ch.push(`[${last}][l${n}]overlay=x=${x}:y=${y}:eval=frame:eof_action=pass[v${n}]`); last = `v${n}`; n++;
  }
  if (caps) { ins.push('-i', caps); ch.push(`[${last}][${inputs}:v]overlay=0:0:eof_action=pass[v${n}]`); inputs++; last = `v${n}`; n++; }
  for (const t of flashes) {
    ch.push(`color=white:s=${W}x${H}:r=${FPS}:d=0.32,format=rgba,fade=t=out:st=0:d=0.32:alpha=1,setpts=PTS-STARTPTS+${t.toFixed(3)}/TB[f${n}]`);
    ch.push(`[${last}][f${n}]overlay=0:0:eof_action=pass[v${n}]`); last = `v${n}`; n++;
  }
  ch.push(`[${last}]format=yuv420p[vout]`);
  const aBase = inputs; // índice do primeiro áudio extra
  audioInputs.forEach((a) => ins.push(...a));
  ch.push(audioFilter(aBase));
  ff([...ins, '-filter_complex', ch.join(';'), '-map', '[vout]', '-map', '[aout]', '-t', total.toFixed(3),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '6M', '-bufsize', '12M', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out]);
  console.log('  ->', path.relative(ROOT, out));
}

// voz de IA (edge-tts) com tempos de cada palavra
function tts(text, voice, rate, name) {
  const mp3 = path.join(TMP, `tts_${name}_${hash([text, voice, rate])}.mp3`);
  const words = mp3.replace('.mp3', '_words.json');
  if (!fs.existsSync(mp3)) {
    execFileSync('python3', ['-I', path.join(__dirname, 'tts.py'), text, mp3, rate, voice], { stdio: 'inherit' });
  }
  return { mp3, words: JSON.parse(fs.readFileSync(words, 'utf8')), d: dur(mp3) };
}

const NAME = (k, mode) => path.join(OUT, `BlackFriday_${k}_${mode === 'feed' ? 'FEED_4x5' : 'STORIES_9x16'}.mp4`);
const cardData = (car, i) => ({ n: i + 1, total: CARS.length, nome: car.nome, versao: car.versao, ano: car.ano, km: car.km, valor: car.valor, centavos: car.centavos, entrada: car.entrada });

// ======================= 1) MÚSICA =======================
async function criativoMusica(mode) {
  const M = C.musica; const total = M.fim - M.inicio;            // ~27,4s
  // tempos relativos ao trecho (palavras da letra): "Se" 4.46 abre o refrão; "flash" 7.66 / 9.60 / 17.84 / 19.28
  const T = { oferta: 4.46, c1: 7.66, c2: 12.46, c3: 17.84, cta: 23.3 };
  const [p, q, r] = CARS;
  const segs = [];
  const add = async (car, a, b, order, zoom) => (await clipsFor(car, b - a, order)).forEach((c) => segs.push({ ...c, zoom }));
  await add(p, 0, T.oferta, ['frente'], 0.12);
  await add(p, T.oferta, T.c1, ['lateral', 'interior'], 0.06);
  await add(p, T.c1, 9.60, ['frente'], 0.05); await add(p, 9.60, T.c2, ['interior', 'bancos'], 0.05);
  await add(q, T.c2, T.c3, ['frente', 'interior'], 0.05);
  await add(r, T.c3, T.cta, ['frente', 'interior'], 0.05);
  await add(p, T.cta, total, ['final', 'frente'], 0.04);
  const base = buildBase(segs, mode, 'musica');

  const L = [];
  L.push({ png: await layer('hook', mode, { kicker: C.oferta.kicker, cond: C.oferta.cond }), st: 0.15, d: T.oferta - 0.15, slide: 'up' });
  L.push({ png: await layer('topo', mode, {}), st: T.oferta, d: T.cta - T.oferta, slide: 'up' });
  L.push({ png: await layer('oferta', mode, C.oferta), st: T.oferta + 0.05, d: T.c1 - T.oferta - 0.05, slide: 'up' });
  for (const [i, st, en] of [[0, T.c1, T.c2], [1, T.c2, T.c3], [2, T.c3, T.cta]]) {
    L.push({ png: await layer('carro', mode, cardData(CARS[i], i)), st: st + 0.05, d: en - st - 0.05, slide: 'left' });
  }
  L.push({ png: await layer('cta', mode, { kicker: 'Condições de Black Friday', sub: 'Toque no botão e mande o<br><b>nome do carro</b> que você quer' }), st: T.cta, d: total - T.cta, keep: true });
  L.push({ png: await layer('local', mode, { local: C.local }), st: 0.3, d: total - 0.3, keep: true });

  compose({ base, mode, layers: L, flashes: [T.oferta, T.c1, 9.60, T.c2, T.c3, 19.28, T.cta].map((t) => t - 0.04), total,
    audioInputs: [['-i', path.join(__dirname, M.arquivo)]],
    audioFilter: (a) => `[${a}:a]atrim=${M.inicio}:${M.fim},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st=${(total - 0.9).toFixed(2)}:d=0.9,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`,
    out: NAME('1_Musica', mode) });
}

// ======================= 2) VOZ DE IA =======================
async function criativoVoz(mode) {
  const V = C.voz;
  const parts = [
    { k: 'intro', ...tts(V.intro, V.voz, V.ritmo, 'intro') },
    { k: 'oferta', ...tts(V.oferta, V.voz, V.ritmo, 'oferta') },
    ...CARS.map((c, i) => ({ k: 'car', i, ...tts(c.fala, V.voz, V.ritmo, c.id) })),
    { k: 'final', ...tts(V.final, V.voz, V.ritmo, 'final') },
  ];
  const GAP = 0.35; let t = 0.25;
  parts.forEach((p) => { p.st = t; t += p.d + GAP; }); const total = t + 0.6;
  // cada trecho de vídeo cobre do início da sua fala até o início da próxima
  parts.forEach((p, i) => { p.a = i === 0 ? 0 : p.st; p.b = i < parts.length - 1 ? parts[i + 1].st : total; });

  const panel = mode === 'feed';
  const segs = [];
  for (const p of parts) {
    const car = p.k === 'car' ? CARS[p.i] : CARS[0];
    const order = p.k === 'car' ? ['frente', 'interior', 'lateral', 'bancos', 'traseira'] : p.k === 'oferta' ? ['lateral', 'interior'] : ['frente'];
    (await clipsFor(car, p.b - p.a, order)).forEach((c) => segs.push({ ...c, panel: panel && p.k === 'car', zoom: p.k === 'car' ? 0 : 0.06 }));
  }
  const base = buildBase(segs, mode, 'voz');

  const L = [];
  for (const p of parts) {
    const d = p.b - p.a;
    if (p.k === 'intro') L.push({ png: await layer('hook', mode, { kicker: C.oferta.kicker, cond: C.oferta.cond }), st: p.a + 0.1, d: d - 0.1, slide: 'up' });
    if (p.k === 'oferta') L.push({ png: await layer('oferta', mode, C.oferta), st: p.a, d, slide: 'up' });
    if (p.k === 'car') {
      L.push({ png: await faixa(mode, CARS[p.i]), st: p.a, d, fade: false });
      L.push({ png: await layer('topo', mode, panel ? { semLogo: true, left: PANEL_X } : {}), st: p.a, d, fade: false });
    }
    if (p.k === 'final') L.push({ png: await layer('cta', mode, { kicker: 'Condições de Black Friday', sub: 'Toque no botão e mande o<br><b>nome do carro</b> que você quer' }), st: p.a, d, keep: true });
  }
  // a localização fica sempre visível onde a faixa/painel não aparece
  const firstCar = parts.find((p) => p.k === 'car'), lastCar = [...parts].reverse().find((p) => p.k === 'car');
  L.push({ png: await layer('local', mode, { local: C.local }), st: 0.3, d: firstCar.a - 0.3 });
  L.push({ png: await layer('local', mode, { local: C.local }), st: lastCar.b, d: total - lastCar.b, keep: true, fade: false });

  // legenda: só nas falas dos carros (na abertura e no fim o texto grande já está na tela)
  const words = parts.filter((p) => p.k === 'car').flatMap((p) => p.words.map((w) => ({ ...w, t: w.t + p.st })));
  const pos = mode === 'stories' ? { top: 700, fs: 92 } : { top: 330, left: PANEL_X + 30, right: 30, fs: 78 };
  const caps = await captionTrack(words, total, mode, pos);

  const voiceIns = parts.map((p) => ['-i', p.mp3]);
  compose({ base, mode, layers: L, caps, total, flashes: [parts[1].st, firstCar.a].map((x) => x - 0.04),
    audioInputs: voiceIns,
    audioFilter: (a) => parts.map((p, i) => `[${a + i}:a]aresample=48000,adelay=${Math.round(p.st * 1000)}|${Math.round(p.st * 1000)}[v${i}]`).join(';') +
      `;[0:a]volume=0.10[amb];${parts.map((_, i) => `[v${i}]`).join('')}[amb]amix=inputs=${parts.length + 1}:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`,
    out: NAME('2_VozIA', mode) });
}

// ======================= 3) VITRINE =======================
async function criativoVitrine(mode) {
  const V = C.vitrine;
  const ab = tts(V.abertura, V.voz, '+5%', 'vit_ab'), fim = tts(V.final, V.voz, '+5%', 'vit_fim');
  const G1 = Math.max(4.2, ab.d + 0.6), PER = 4.2, G2 = Math.max(4.0, fim.d + 1.2);
  const total = G1 + PER * CARS.length + G2;
  const GEO = mode === 'stories' ? { y0: 470, h: 760 } : { y0: 0, h: 1350 };
  const gridSrc = async (d) => Promise.all(CARS.map(async (c) => (await clipsFor(c, d, ['frente']))[0]));
  const segs = [{ grid: await gridSrc(G1), a: 0, b: G1, gy0: GEO.y0, gh: GEO.h }];
  for (const c of CARS) (await clipsFor(c, PER, ['frente', 'interior'])).forEach((s) => segs.push({ ...s, zoom: 0.05 }));
  segs.push({ grid: await gridSrc(G2), a: 0, b: G2, gy0: GEO.y0, gh: GEO.h });
  const base = buildBase(segs, mode, 'vitrine');

  const L = [];
  const gr = await layer('grade', mode, { ...GEO, carros: CARS.map((c) => ({ nome: c.nome, ano: c.ano, km: c.km, valor: c.valor, centavos: c.centavos })) });
  L.push({ png: gr, st: 0, d: G1, fade: false });
  const y1 = mode === 'stories' ? 290 : 30;
  L.push({ png: await layer('titulo', mode, { texto: 'Black Friday • escolha o seu', red: true, y: y1 }), st: 0.1, d: G1 - 0.1, slide: 'up' });
  L.push({ png: await layer('local', mode, { local: C.local, top: y1 + 92 }), st: 0.4, d: G1 - 0.4, slide: 'up' });
  for (const [i, c] of CARS.entries()) {
    const st = G1 + i * PER;
    L.push({ png: await layer('carro', mode, cardData(c, i)), st: st + 0.05, d: PER - 0.05, slide: 'left' });
    L.push({ png: await layer('topo', mode, {}), st, d: PER, fade: false });
    L.push({ png: await layer('local', mode, { local: C.local }), st, d: PER, fade: false });
  }
  const g2 = G1 + PER * CARS.length;
  L.push({ png: gr, st: g2, d: G2, fade: false, keep: true });
  L.push({ png: await layer('cta', mode, { kicker: 'Tanque cheio + documentação inclusa', sub: 'Mande o <b>nome do carro</b> e<br>simule sua entrada' }), st: g2 + 0.6, d: G2 - 0.6, keep: true });
  L.push({ png: await layer('local', mode, { local: C.local }), st: g2, d: G2, keep: true, fade: false });

  compose({ base, mode, layers: L, total, flashes: [G1, G1 + PER, G1 + 2 * PER, g2].map((t) => t - 0.04),
    audioInputs: [['-i', ab.mp3], ['-i', fim.mp3]],
    audioFilter: (a) => `[${a}:a]aresample=48000,adelay=300|300[v0];[${a + 1}:a]aresample=48000,adelay=${Math.round((g2 + 0.7) * 1000)}|${Math.round((g2 + 0.7) * 1000)}[v1];` +
      `[0:a]volume=0.35[amb];[v0][v1][amb]amix=inputs=3:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`,
    out: NAME('3_Vitrine', mode) });
}

(async () => {
  browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const todo = which.length ? which : ['musica', 'voz', 'vitrine'];
  for (const k of todo) for (const m of modes) {
    console.log(`${k} ${m}`);
    await ({ musica: criativoMusica, voz: criativoVoz, vitrine: criativoVitrine })[k](m);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
