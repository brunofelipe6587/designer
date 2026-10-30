// Shared drawing kit for the Black Sand Walk (semana 1, sungas) ad creatives.
// Offer: 3 sungas por R$ 179 · de R$ 209,70 · economize R$ 30 · válido de 02 a 08/11 ou enquanto durar o estoque.
// Brand: black + #FFCC29, Syne bold for titles, Inter for support/buttons, wide white SAND WALK logo.
// Partner athletes are drawn from the approved cutouts (../build/cut*.png) with their ORIGINAL pixels: no filter,
// no colour change on them — only a blurred tinted copy behind as rim light.
const YEL = '#FFCC29', WHITE = '#FFFFFF', GREY = '#9A9A9A', INK = '#0A0A0A';
let W = 1080, H = 1350, ctx;
let FX = 1;   // device px per layout px (blur/shadow radii ignore the canvas transform)
const IMG = {};
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eout = u => 1 - Math.pow(1 - u, 3);
const eio = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const eback = u => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const lerp = (a, b, u) => a + (b - a) * u;

// sungas that cost R$ 69,90 on the site (3 × 69,90 = 209,70)
const SUNGAS = ['blackout', 'graffiti', 'allblack', 'shadow', 'hupi_fire', 'grafite_premium', 'shadow_laranja', 'stars',
                'pincelada_fluor', 'splash', 'tricolor'];
// athletes: crops in source px that keep the approved framing (cut1: head/shoulders only, the child's gap stays out;
// cut2: faded above the waist so the third-party swimwear never shows)
const ATH = {
  a1: { crop: [900, 280, 700, 900], fade: [0.58, 0.95] },
  a2: { crop: [180, 120, 1600, 1440], fade: [0.72, 0.99] },
  a3: { crop: [200, 0, 1100, 1900], fade: [0.60, 0.95] },
};

function load(src) { const im = new Image(); im.src = src; return im.decode().then(() => im); }
async function loadCommon(extra = {}) {
  const jobs = [['a1', '../build/cut1.png'], ['a2', '../build/cut2.png'], ['a3', '../build/cut3.png'], ['logo', '../build/logo_wide_white.svg']];
  for (const s of SUNGAS) jobs.push(['s_' + s, `../build/sunga_${s}_crop.png`]);
  for (const k in extra) jobs.push([k, extra[k]]);
  await Promise.all(jobs.map(async ([k, src]) => { IMG[k] = await load(src); }));
  const gc = document.createElement('canvas'); gc.width = 540; gc.height = 540; const g = gc.getContext('2d'), d = g.createImageData(540, 540);
  for (let p = 0; p < d.data.length; p += 4) { const v = hash(p * 0.17) * 255; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = hash(p * 0.31) < 0.5 ? 12 : 0; }
  g.putImageData(d, 0, 0); IMG.grain = gc;
  for (const f of ['700 40px Syne', '800 40px Syne', '900 40px Inter', '800 40px Inter', '700 40px Inter', '600 40px Inter', '500 40px Inter'])
    await document.fonts.load(f, 'R$ÁÍÇÃÉÚ→✓×=+');
  await document.fonts.ready;
}

// ---------- backgrounds ----------
function bgBlack(glows = [[W * 0.5, H * 0.4, 0.16]], net = true) {
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H);
  for (const [x, y, a, r] of glows) {
    const g = ctx.createRadialGradient(x, y, 20, x, y, r || W * 0.75);
    g.addColorStop(0, `rgba(255,204,41,${a})`); g.addColorStop(0.5, `rgba(255,204,41,${a * 0.3})`); g.addColorStop(1, 'rgba(255,204,41,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (net) {   // futevôlei net texture
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.045)'; ctx.lineWidth = 2;
    for (let i = -H; i < W; i += 46) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + H, 0); ctx.lineTo(i, H); ctx.stroke(); }
    ctx.restore();
  }
  grain();
}
function grain() { for (let y = 0; y < H; y += 540) for (let x = 0; x < W; x += 540) ctx.drawImage(IMG.grain, x, y); }
function tape(x0, y0, x1, y1, color, textColor, text, h = 60, size = 28, shift = 0) {
  const ang = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0) + 400;
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ctx.translate(-200, 0);
  ctx.fillStyle = color; ctx.fillRect(0, -h / 2, len, h);
  ctx.font = `700 ${size}px Syne`; ctx.fillStyle = textColor; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const w = ctx.measureText(text).width, s = ((shift % w) + w) % w;
  for (let x = 20 - s; x < len; x += w) ctx.fillText(text, x, 2);
  ctx.restore();
}

// ---------- athletes ----------
const athCache = new Map();
function athleteLayer(key, s, cropOverride, fadeOverride) {
  const id = key + s + JSON.stringify(cropOverride || '') + JSON.stringify(fadeOverride || '');
  if (athCache.has(id)) return athCache.get(id);
  const img = IMG[key], [sx, sy, sw, sh] = cropOverride || ATH[key].crop, fade = fadeOverride || ATH[key].fade;
  const dw = sw * s, dh = sh * s;
  const c = document.createElement('canvas'); c.width = Math.ceil(dw); c.height = Math.ceil(dh);
  const g = c.getContext('2d'); g.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  if (fade) {
    g.globalCompositeOperation = 'destination-in';
    const lg = g.createLinearGradient(0, dh * fade[0], 0, dh * fade[1]); lg.addColorStop(0, 'rgba(0,0,0,1)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lg; g.fillRect(0, 0, dw, dh);
  }
  const r = document.createElement('canvas'); r.width = c.width; r.height = c.height; const rg = r.getContext('2d');
  rg.drawImage(c, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = YEL; rg.fillRect(0, 0, r.width, r.height);
  const out = { c, r }; athCache.set(id, out); return out;
}
// draws an athlete cutout at (x, y) top-left; rim = yellow glow alpha (0 = none)
function athlete(key, x, y, s, { rim = 0.55, alpha = 1, crop, fade, rot = 0 } = {}) {
  const L = athleteLayer(key, s, crop, fade);
  ctx.save(); ctx.globalAlpha *= alpha;
  if (rot) { const cx = x + L.c.width / 2, cy = y + L.c.height / 2; ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy); }
  if (rim) { ctx.save(); ctx.globalAlpha *= rim; ctx.filter = 'blur(14px)'; ctx.drawImage(L.r, x + 6, y - 4); ctx.restore(); }
  ctx.drawImage(L.c, x, y); ctx.restore();
  return L.c;
}

// ---------- sungas ----------
const silCache = new Map();
function sungaSil(key, w) {
  const id = key + w; if (silCache.has(id)) return silCache.get(id);
  const img = IMG['s_' + key], h = w * img.height / img.width;
  const pad = 20 * FX, sil = document.createElement('canvas'); sil.width = Math.ceil(w + 2 * pad); sil.height = Math.ceil(h + 2 * pad); const sg = sil.getContext('2d');
  sg.drawImage(img, pad, pad, w, h); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#FFFFFF'; sg.fillRect(0, 0, sil.width, sil.height);
  silCache.set(id, sil); return sil;
}
// studio treatment so dark sungas separate from the black background: spotlight, thin white rim, soft shadow
function sunga(key, cx, cy, w, rot = 0, { spot = 0.30, rimA = 0.6, alpha = 1, reflect = false } = {}) {
  const img = IMG['s_' + key], h = w * img.height / img.width;
  ctx.save(); ctx.globalAlpha *= alpha; const A = ctx.globalAlpha;
  if (spot) {
    const sp = ctx.createRadialGradient(cx, cy - 6, 10, cx, cy, w * 0.78);
    sp.addColorStop(0, `rgba(255,255,255,${spot})`); sp.addColorStop(0.45, `rgba(255,236,170,${spot * 0.4})`); sp.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sp; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.8, h * 0.95, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (reflect) {
    const rf = document.createElement('canvas'); rf.width = Math.ceil(w * FX); rf.height = Math.ceil(h * 0.45 * FX); const rgx = rf.getContext('2d');
    rgx.translate(0, rf.height); rgx.scale(FX, -0.45 * FX); rgx.drawImage(img, 0, 0, w, h); rgx.setTransform(1, 0, 0, 1, 0, 0);
    rgx.globalCompositeOperation = 'destination-in';
    const fl = rgx.createLinearGradient(0, 0, 0, rf.height); fl.addColorStop(0, 'rgba(0,0,0,0.22)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
    rgx.fillStyle = fl; rgx.fillRect(0, 0, rf.width, rf.height);
    ctx.drawImage(rf, cx - w / 2, cy + h * 0.5 + 4, rf.width / FX, rf.height / FX);
  }
  ctx.translate(cx, cy); ctx.rotate(rot);
  if (rimA) {
    const sil = sungaSil(key, Math.round(w * FX)), sw = sil.width / FX, sh = sil.height / FX;
    ctx.save(); ctx.globalAlpha = A * rimA; ctx.filter = `blur(${3 * FX}px)`; ctx.drawImage(sil, -sw / 2, -sh / 2, sw, sh); ctx.restore();
    ctx.save(); ctx.globalAlpha = A * rimA * 0.5; ctx.filter = `blur(${14 * FX}px)`; ctx.drawImage(sil, -sw / 2, -sh / 2, sw, sh); ctx.restore();
  }
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * FX; ctx.shadowOffsetY = 10 * FX;
  ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
  return h;
}

// ---------- type & UI ----------
function txt(s, x, y, font, color, align = 'left', base = 'alphabetic') {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
  return ctx.measureText(s).width;
}
function glowTxt(s, x, y, font, color = YEL, blur = 50, a = 0.55, align = 'left') {
  ctx.save(); ctx.shadowColor = `rgba(255,204,41,${a})`; ctx.shadowBlur = blur * FX; const w = txt(s, x, y, font, color, align); ctx.restore(); return w;
}
function seal(x, y, s = 'BLACK SAND WALK', size = 34, rot = -0.035, bg = YEL, fg = INK, align = 'left') {
  ctx.save(); ctx.font = `700 ${size}px Syne`; const w = ctx.measureText(s).width + size * 1.6, h = size * 1.8;
  ctx.translate(x - (align === 'center' ? w / 2 : 0), y); ctx.rotate(rot);
  ctx.fillStyle = bg; ctx.fillRect(0, -h / 2, w, h); ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(s, size * 0.8, size * 0.08); ctx.restore(); return w;
}
function strike(s, x, y, font, color = GREY, line = '#D8D8D8', align = 'left') {
  const w = txt(s, x, y, font, color, align); const size = parseInt(font.match(/(\d+)px/)[1], 10);
  const x0 = align === 'center' ? x - w / 2 : x;
  ctx.fillStyle = line; ctx.fillRect(x0 - 2, y - size * 0.36, w + 4, Math.max(3, size * 0.08)); return w;
}
function pill(s, x, y, size = 30, filled = false, align = 'left') {
  ctx.font = `800 ${size}px Inter`; const w = ctx.measureText(s).width + size * 1.5, h = size * 1.7;
  const x0 = align === 'center' ? x - w / 2 : x;
  ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, h / 2);
  if (filled) { ctx.fillStyle = YEL; ctx.fill(); } else { ctx.strokeStyle = YEL; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.fillStyle = filled ? INK : YEL; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(s, x0 + w / 2, y + 2);
  return w;
}
function cta(s, cx, cy, w, h, size = 34, glow = 0.45) {
  ctx.save(); ctx.shadowColor = `rgba(255,204,41,${glow})`; ctx.shadowBlur = 30 * FX;
  ctx.fillStyle = YEL; ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 14); ctx.fill(); ctx.restore();
  txt(s, cx, cy + 2, `800 ${size}px Inter`, INK, 'center', 'middle');
}
function logo(x, y, w, align = 'left', alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(IMG.logo, align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, y, w, w * 30 / 480); ctx.restore();
}
function footer(y, size = 24, color = '#8C8C8C', x = W / 2, align = 'center') {
  txt('Válido de 02 a 08/11 ou enquanto durar o estoque', x, y, `500 ${size}px Inter`, color, align);
}
function vignette(a = 0.6, cy = H * 0.45) {
  const g = ctx.createRadialGradient(W / 2, cy, W * 0.3, W / 2, cy, W * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function vfade(y0, y1, a0 = 0, a1 = 0.95, col = '5,5,5') {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${col},${a0})`); g.addColorStop(1, `rgba(${col},${a1})`);
  ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0));
}

// ---------- video frames (JPEG sequences prepared by prep_frames.sh) ----------
const fcache = new Map();
function frameImg(dir, n, i) {
  i = clamp(Math.round(i), 1, n); const key = dir + i;
  if (!fcache.has(key)) { const im = new Image(); im.src = `${dir}/${String(i).padStart(4, '0')}.jpg`; fcache.set(key, im.decode().then(() => im)); if (fcache.size > 60) fcache.delete(fcache.keys().next().value); }
  return fcache.get(key);
}
// plays clip u∈[0,1] full-frame with zoom z around (ax, ay) in clip px; filter optional
// f = frame position (1-based, fractional → blends the two neighbours, for slow motion)
async function drawFrame(dir, n, f, { z = 1, ax = 540, ay = 960, alpha = 1, filter = 'none' } = {}) {
  f = clamp(f, 1, n); const ia = Math.floor(f), fr = f - ia;
  const a = await frameImg(dir, n, ia), b = fr > 0.05 && ia < n ? await frameImg(dir, n, ia + 1) : null;
  ax = clamp(ax, 540 / z, 1080 - 540 / z); ay = clamp(ay, 960 / z, 1920 - 960 / z);
  ctx.save(); ctx.globalAlpha = alpha; ctx.filter = filter;
  ctx.translate(W / 2, H / 2); ctx.scale(z * W / 1080, z * W / 1080); ctx.translate(-ax, -ay);
  ctx.drawImage(a, 0, 0, 1080, 1920);
  if (b) { ctx.globalAlpha = alpha * fr; ctx.drawImage(b, 0, 0, 1080, 1920); }
  ctx.restore();
}
const drawClip = (dir, n, u, o) => drawFrame(dir, n, 1 + clamp(u, 0, 1) * (n - 1), o);

// ---------- motion helpers (videos) ----------
const pop = (t, t0, d = 0.35) => t < t0 ? 0 : eback(prog(t, t0, t0 + d));
const enter = (t, t0, d = 0.4) => eout(prog(t, t0, t0 + d));
function flash(t, t0, d = 0.18, a = 0.85, col = '255,255,255') {
  if (t < t0 || t > t0 + d) return; ctx.fillStyle = `rgba(${col},${a * (1 - (t - t0) / d)})`; ctx.fillRect(0, 0, W, H);
}
const shake = (t, t0, amp = 14, d = 0.3) => (t < t0 || t > t0 + d) ? 0 : amp * (1 - (t - t0) / d) * Math.sin((t - t0) * 90);
// draws fn() scaled by s around (cx, cy) with alpha a
function scaled(cx, cy, s, a, fn) {
  if (s <= 0.001 || a <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); fn(); ctx.restore();
}
// the offer, centred; parts enter from t0 (each part can be timed). Returns nothing.
function offerStack(t, t0, y, { head = '3 SUNGAS POR', size = 180, gap = [0, 0.25, 0.7, 0.95], noAnchor = false } = {}) {
  scaled(540, y, pop(t, t0 + gap[0]), 1, () => txt(head, 540, y, '700 76px Syne', WHITE, 'center'));
  const py = y + size * 0.95, sh = shake(t, t0 + gap[1], 16);
  scaled(540, py - size * 0.35, pop(t, t0 + gap[1], 0.4), 1, () => glowTxt('R$ 179', 540 + sh, py, `700 ${size}px Syne`, YEL, 60, 0.6, 'center'));
  if (noAnchor) return;
  const ay = py + size * 0.42;
  ctx.font = '600 34px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 28px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 42, tot = dw + 28 + pw, x0 = 540 - tot / 2;
  const ua = enter(t, t0 + gap[2], 0.3);
  if (ua > 0) {
    ctx.save(); ctx.globalAlpha *= ua; txt('De R$ 209,70', x0, ay, '600 34px Inter', GREY);
    ctx.fillStyle = '#D8D8D8'; ctx.fillRect(x0 - 2, ay - 12, (dw + 4) * enter(t, t0 + gap[2] + 0.1, 0.3), 3); ctx.restore();
  }
  scaled(x0 + dw + 28 + pw / 2, ay - 12, pop(t, t0 + gap[3]), 1, () => pill('ECONOMIZE R$ 30', x0 + dw + 28, ay - 12, 28));
}
function ctaPulse(t, t0, y, label = 'APROVEITAR OFERTA  →', beat = 0.5) {
  const s = pop(t, t0, 0.4) * (1 + 0.035 * Math.max(0, Math.cos(((t - t0) % beat) / beat * Math.PI * 2)) * (t > t0 + 0.4));
  scaled(540, y, s, 1, () => cta(label, 540, y, 640, 96, 36));
}
