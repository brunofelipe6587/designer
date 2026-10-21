// Edição padrão Fabrício Veículos: um vídeo cru -> FEED 4:5 (painel lateral) + STORIES 9:16 (faixa).
// Uso: node editar.js carros/<pasta-do-carro> [--so-faixas] [--provas]
//   A pasta tem info.json e o vídeo cru (qualquer .mp4/.mov). Saída em out/<pasta>/.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FEED = { w: 1080, h: 1350, videoX: 312 };   // vídeo cru ocupa da borda do painel até a direita
const STORIES = { w: 1080, h: 1920 };

const dir = path.resolve(process.argv[2] || '');
const onlyOverlays = process.argv.includes('--so-faixas');
const proofs = process.argv.includes('--provas') || onlyOverlays;
const info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));
const slug = path.basename(dir);
const out = path.join(__dirname, 'out', slug);
fs.mkdirSync(out, { recursive: true });
const raw = info.video ? path.join(dir, info.video)
  : fs.readdirSync(dir).filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f)).map((f) => path.join(dir, f))[0];

const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

async function renderOverlays() {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const files = {};
  for (const [mode, size] of [['feed', FEED], ['stories', STORIES]]) {
    const page = await browser.newPage({ viewport: { width: size.w, height: size.h } });
    await page.goto('file://' + path.join(__dirname, 'template', 'faixas.html'));
    await page.evaluate(([m, d]) => window.render(m, d), [mode, info]);
    files[mode] = path.join(out, `faixa_${mode}.png`);
    await page.screenshot({ path: files[mode], omitBackground: true, clip: { x: 0, y: 0, width: size.w, height: size.h } });
    await page.close();
  }
  await browser.close();
  return files;
}

// Prova de área segura: sombreia as zonas cobertas pela interface do Instagram/Facebook.
function proof(mode, framePng) {
  const dst = path.join(out, `prova_${mode}.png`);
  const boxes = mode === 'stories'
    ? 'drawbox=y=0:w=iw:h=269:color=0x00a2ff@0.28:t=fill,drawbox=y=1248:w=iw:h=672:color=0xffcc00@0.22:t=fill,drawbox=y=1536:w=iw:h=384:color=0x00a2ff@0.30:t=fill'
    : 'drawbox=x=0:y=0:w=iw:h=ih:color=0x00a2ff@0.0:t=fill';
  ff(['-i', framePng, '-vf', boxes, dst]);
  return dst;
}

(async () => {
  const ov = await renderOverlays();
  console.log('faixas:', ov.feed, ov.stories);
  if (!raw) { console.log('sem vídeo cru na pasta; gerei só as faixas.'); return; }

  const trim = [];
  if (info.inicio) trim.push('-ss', String(info.inicio));
  if (info.fim) trim.push('-to', String(info.fim));
  const fps = info.fps || 30;
  const enc = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-r', String(fps), '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart'];
  const name = (info.nome_arquivo || slug).replace(/[^\w.-]+/g, '_');

  // foco do enquadramento (0 = esquerda/topo, 0.5 = centro, 1 = direita/base)
  const fx = info.foco_x ?? 0.5, fy = info.foco_y ?? 0.5;
  const vw = FEED.w - FEED.videoX, vh = FEED.h;
  const cover = (w, h) => `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}:(iw-${w})*${fx}:(ih-${h})*${fy},setsar=1`;

  const feedOut = path.join(out, `${name}_FEED_4x5.mp4`);
  const storiesOut = path.join(out, `${name}_STORIES_9x16.mp4`);
  if (!onlyOverlays) {
    ff([...trim, '-i', raw, '-loop', '1', '-i', ov.feed, '-filter_complex',
      `[0:v]fps=${fps},${cover(vw, vh)}[v];color=black:${FEED.w}x${FEED.h}:r=${fps}[bg];[bg][v]overlay=${FEED.videoX}:0:shortest=1[b];[b][1:v]overlay=0:0:shortest=1,format=yuv420p[o]`,
      '-map', '[o]', '-map', '0:a?', ...enc, '-shortest', feedOut]);
    ff([...trim, '-i', raw, '-loop', '1', '-i', ov.stories, '-filter_complex',
      `[0:v]fps=${fps},${cover(STORIES.w, STORIES.h)}[v];[v][1:v]overlay=0:0:shortest=1,format=yuv420p[o]`,
      '-map', '[o]', '-map', '0:a?', ...enc, '-shortest', storiesOut]);
    console.log('vídeos:', feedOut, storiesOut);
  }

  if (proofs) {
    const t = String(info.prova_t ?? 1.5);
    const fFrame = path.join(out, '_frame_feed.png'), sFrame = path.join(out, '_frame_stories.png');
    if (onlyOverlays) {
      ff(['-ss', t, '-i', raw, '-i', ov.feed, '-filter_complex', `[0:v]${cover(vw, vh)}[v];color=black:${FEED.w}x${FEED.h}[bg];[bg][v]overlay=${FEED.videoX}:0[b];[b][1:v]overlay=0:0`, '-frames:v', '1', fFrame]);
      ff(['-ss', t, '-i', raw, '-i', ov.stories, '-filter_complex', `[0:v]${cover(STORIES.w, STORIES.h)}[v];[v][1:v]overlay=0:0`, '-frames:v', '1', sFrame]);
    } else {
      ff(['-ss', t, '-i', feedOut, '-frames:v', '1', fFrame]);
      ff(['-ss', t, '-i', storiesOut, '-frames:v', '1', sFrame]);
    }
    fs.copyFileSync(fFrame, path.join(out, 'quadro_feed.png'));
    fs.copyFileSync(sFrame, path.join(out, 'quadro_stories.png'));
    console.log('provas:', proof('stories', sFrame));
    fs.rmSync(fFrame); fs.rmSync(sFrame);
  }
})().catch((e) => { console.error(e); process.exit(1); });
