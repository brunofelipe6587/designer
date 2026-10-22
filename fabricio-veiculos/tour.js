// Versão TOUR (teste A/B da edição padrão): ~25s com gancho, capítulos e tela final de WhatsApp,
// mantendo o mesmo painel (feed) e a mesma faixa (stories) da edição validada.
// Uso: node tour.js carros/<pasta-do-carro>   (lê "tour" dentro do info.json)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SIZE = { feed: { w: 1080, h: 1350, videoX: 312 }, stories: { w: 1080, h: 1920 } };
const FPS = 30;

const dir = path.resolve(process.argv[2] || '');
const info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));
const tour = info.tour;
const slug = path.basename(dir);
const out = path.join(__dirname, 'out', slug, 'tour');
fs.mkdirSync(out, { recursive: true });
const raw = info.video ? path.join(dir, info.video)
  : fs.readdirSync(dir).filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f)).map((f) => path.join(dir, f))[0];
const name = (info.nome_arquivo || slug).replace(/[^\w.-]+/g, '_');
const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

// 1) corta os trechos do vídeo cru e emenda (som ambiente com micro-fade em cada emenda)
function cutRaw() {
  const dst = path.join(out, '_tour_bruto.mp4');
  const parts = tour.cortes.map(([a, b], i) => {
    const d = (b - a).toFixed(3);
    return `[0:v]trim=${a}:${b},setpts=PTS-STARTPTS,fps=${FPS}[v${i}];` +
      `[0:a]atrim=${a}:${b},asetpts=PTS-STARTPTS,afade=t=in:d=0.06,afade=t=out:st=${(d - 0.08).toFixed(3)}:d=0.08[a${i}];`;
  }).join('');
  const cat = tour.cortes.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${tour.cortes.length}:v=1:a=1[v][a]`;
  ff(['-i', raw, '-filter_complex', parts + cat, '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-c:a', 'aac', '-b:a', '192k', dst]);
  let t = 0;
  const segs = tour.cortes.map(([a, b, label]) => { const s = { start: t, dur: b - a, label }; t += b - a; return s; });
  return { file: dst, segs, total: t };
}

// 2) renderiza as camadas (faixa padrão + gancho + capítulos + tela final) em PNG transparente
async function renderLayers(segs) {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const layers = { feed: {}, stories: {} };
  const chapters = segs.filter((s) => s.label);
  for (const mode of ['feed', 'stories']) {
    const page = await browser.newPage({ viewport: { width: SIZE[mode].w, height: SIZE[mode].h } });
    const shot = async (file) => {
      const p = path.join(out, file);
      await page.screenshot({ path: p, omitBackground: true, clip: { x: 0, y: 0, width: SIZE[mode].w, height: SIZE[mode].h } });
      return p;
    };
    await page.goto('file://' + path.join(__dirname, 'template', 'faixas.html'));
    await page.evaluate(([m, d]) => window.render(m, d), [mode, info]);
    layers[mode].faixa = await shot(`faixa_${mode}.png`);

    await page.goto('file://' + path.join(__dirname, 'template', 'tour.html'));
    await page.evaluate(([m, d]) => window.render('hook', m, d), [mode, tour.gancho]);
    layers[mode].hook = await shot(`gancho_${mode}.png`);
    await page.evaluate(([m, d]) => window.render('end', m, d), [mode, tour.final]);
    layers[mode].end = await shot(`final_${mode}.png`);
    layers[mode].chap = [];
    for (const [i, s] of chapters.entries()) {
      await page.evaluate(([m, d]) => window.render('chap', m, d), [mode, { label: s.label, n: i + 1, total: chapters.length }]);
      layers[mode].chap.push(await shot(`cap${i + 1}_${mode}.png`));
    }
    await page.close();
  }
  await browser.close();
  return layers;
}

// 3) monta o vídeo: base + faixa fixa + camadas com fade/deslize nos seus tempos
function compose(mode, cut, L) {
  const { w, h, videoX } = SIZE[mode];
  const rawH = parseInt(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=height', '-of', 'csv=p=0', cut.file]).toString(), 10);
  const sharpen = rawH < 1280 ? ',unsharp=5:5:0.7:5:5:0' : '';
  const vw = mode === 'feed' ? w - videoX : w;
  const base = `[0:v]scale=${vw}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${vw}:${h},setsar=1${sharpen}` +
    (mode === 'feed' ? `,pad=${w}:${h}:${videoX}:0:black` : '') + '[b0]';

  const hookDur = Math.min(tour.gancho.duracao ?? 2.8, cut.segs[0].dur);
  const endSeg = cut.segs[cut.segs.length - 1];
  const timed = [{ png: L.hook, start: 0, dur: hookDur, slide: true, fadeIn: false }];
  let ci = 0;
  cut.segs.forEach((s, i) => {
    if (!s.label) return;
    const st = i === 0 ? hookDur : s.start;            // no 1º trecho o capítulo entra depois do gancho
    const en = s.start + s.dur;
    if (en - st > 0.4) timed.push({ png: L.chap[ci], start: st, dur: en - st, slide: true, fadeIn: true });
    ci++;
  });
  timed.push({ png: L.end, start: endSeg.start, dur: endSeg.dur, slide: false, fadeIn: true });

  const inputs = ['-i', cut.file];
  const chains = [base];
  let last = 'b0';
  timed.forEach((o, k) => {
    inputs.push('-framerate', String(FPS), '-loop', '1', '-t', o.dur.toFixed(3), '-i', o.png);
    const idx = k + 1;
    const fin = o.fadeIn ? `fade=t=in:st=0:d=0.25:alpha=1,` : '';
    chains.push(`[${idx}:v]format=rgba,${fin}fade=t=out:st=${Math.max(0, o.dur - 0.2).toFixed(3)}:d=0.2:alpha=1,setpts=PTS-STARTPTS+${o.start.toFixed(3)}/TB[o${idx}]`);
    const x = o.slide ? `'-60*max(0,1-(t-${o.start.toFixed(3)})/0.3)'` : '0';
    chains.push(`[${last}][o${idx}]overlay=x=${x}:y=0:eval=frame:eof_action=pass[b${idx}]`);
    last = `b${idx}`;
  });
  // a faixa padrão fica por cima de tudo, do início ao fim (é ela que qualifica o lead)
  inputs.push('-loop', '1', '-i', L.faixa);
  const fi = timed.length + 1;
  chains.push(`[${last}][${fi}:v]overlay=0:0:shortest=1,format=yuv420p[o]`);

  const dst = path.join(out, `${name}_TOUR_${mode === 'feed' ? 'FEED_4x5' : 'STORIES_9x16'}.mp4`);
  ff([...inputs, '-filter_complex', chains.join(';'), '-map', '[o]', '-map', '0:a', '-t', cut.total.toFixed(3),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '6M', '-bufsize', '12M', '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', dst]);
  return dst;
}

(async () => {
  const cut = cutRaw();
  console.log('corte:', cut.total.toFixed(1) + 's', cut.segs.map((s) => `${s.label || 'FINAL'} ${s.start.toFixed(1)}s`).join(' | '));
  const L = await renderLayers(cut.segs);
  for (const mode of ['feed', 'stories']) console.log('vídeo:', compose(mode, cut, L[mode]));
  fs.rmSync(cut.file);
})().catch((e) => { console.error(e); process.exit(1); });
