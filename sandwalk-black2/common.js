// Shared drawing kit for the Black Sand Walk ad creatives — copied from ../sandwalk-black/ads/common.js for week 2
// (women's kits): the product images are the kit cutouts (build/kit_<name>.png), drawn with the same studio treatment
// as the sungas (sunga() / kit()).
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

// women's kits (manga longa + manga curta + shorts), best sellers first (sales report): R$ 189,70 each on the site
const KITS = ['blackout', 'void', 'everflame', 'egypt', 'rhythm', 'vivid', 'brasil', 'megawave', 'phoenix', 'vintagemap'];
const KIT_NAME = { blackout: 'Blackout', void: 'Void', everflame: 'Ever Flame', egypt: 'Egypt', rhythm: 'Rhythm of the Street',
  vivid: 'Vivid', brasil: 'Brasil', megawave: 'Mega Wave', phoenix: 'Phoenix', vintagemap: 'Vintage Map' };
// offer (week 2): 15% off on the women's kits
const OFF = { pct: '15% OFF', from: 'R$ 189,70', to: 'R$ 161,25', dates: '09 a 15/11', datesLong: 'de 09 a 15/11' };
const SUNGAS = KITS;
// athletes: crops in source px that keep the approved framing (cut1: head/shoulders only, the child's gap stays out;
// cut2: faded above the waist so the third-party swimwear never shows)
const ATH = {
  a1: { crop: [900, 280, 700, 900], fade: [0.58, 0.95] },
  a2: { crop: [180, 120, 1600, 1440], fade: [0.72, 0.99] },
  a3: { crop: [200, 0, 1100, 1900], fade: [0.60, 0.95] },
};

function load(src) { const im = new Image(); im.src = src; return im.decode().then(() => im); }
async function loadCommon(extra = {}) {
  const jobs = [['logo', 'build/logo_wide_white.svg']];
  for (const s of KITS) jobs.push(['s_' + s, `build/kit_${s}.png`]);
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
const kit = (...a) => sunga(...a);
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
function ctaPulse(t, t0, y, label = 'APROVEITAR OFERTA  →', beat = 0.5, w = 640, h = 96, fs = 36) {
  const s = pop(t, t0, 0.4) * (1 + 0.035 * Math.max(0, Math.cos(((t - t0) % beat) / beat * Math.PI * 2)) * (t > t0 + 0.4));
  scaled(540, y, s, 1, () => cta(label, 540, y, w, h, fs));
}
// a video frame cover-fitted into a rounded panel (x, y, w, h); z zooms in around (ax, ay) in clip px
async function framePanel(dir, n, f, x, y, w, h, { z = 1, ax = 540, ay = 960, r = 22, filter = 'none', alpha = 1 } = {}) {
  f = clamp(f, 1, n); const ia = Math.floor(f), fr = f - ia;
  const a = await frameImg(dir, n, ia), b = fr > 0.05 && ia < n ? await frameImg(dir, n, ia + 1) : null;
  const s = Math.max(w / 1080, h / 1920) * z, vw = w / s, vh = h / s;
  const sx = clamp(ax - vw / 2, 0, 1080 - vw), sy = clamp(ay - vh / 2, 0, 1920 - vh);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip(); ctx.filter = filter;
  ctx.drawImage(a, sx, sy, vw, vh, x, y, w, h);
  if (b) { ctx.globalAlpha *= fr; ctx.drawImage(b, sx, sy, vw, vh, x, y, w, h); }
  ctx.restore();
}

// ---------- the 3 partner athletes side by side (clean banners) ----------
// Approved arrangement: regata athlete at the left edge (his cutout is cut at x 1015 where the child was; the
// small gaps there are filled with his jersey black by ../fill_cut1_gaps.py), the shirtless athlete turned 17°
// so he stands straight, ball in front (option A), the crossed-arms athlete on the right. Original pixels, no
// fades. Units: group units (1 = 1 layout px at G = 1); origin = the regata athlete's top-left.
const GROUP = [['a1f', [1015, 330, 1600, 1600], 0.44, 0, 0, 0],
               ['a2', [100, 100, 1855, 1600], 0.35, 17, 80, -32],
               ['a3', [280, 0, 1260, 1800], 0.34, 0, 498, 5]];
const GROUP_ORDER = [0, 2, 1];
function groupLayer(key, [x0, y0, x1, y1], d, deg) {
  const img = IMG[key], w = (x1 - x0) * d, h = (y1 - y0) * d, a = deg * Math.PI / 180;
  const c = document.createElement('canvas');
  c.width = Math.ceil(Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))); c.height = Math.ceil(Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a)));
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
  g.translate(c.width / 2, c.height / 2); g.rotate(a); g.drawImage(img, x0, y0, x1 - x0, y1 - y0, -w / 2, -h / 2, w, h);
  const r = document.createElement('canvas'); r.width = c.width; r.height = c.height; const rg = r.getContext('2d');
  rg.drawImage(c, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = YEL; rg.fillRect(0, 0, r.width, r.height);
  return { c, r };
}
// G = group scale, (ox, oy) = origin in layout units, K = device px per layout unit, cutY = layout y where bodies end
// dx = per-athlete horizontal nudges (group units), e.g. [0, 30, 0]
function athleteGroup(G, ox, oy, K, cutY, { rimA = 0.42, dx = [0, 0, 0] } = {}) {
  const L = GROUP.map(([k, crop, s, deg, x, y], i) => ({ ...groupLayer(k, crop, s * G * K, deg), x: (ox + (x + dx[i]) * G) * K, y: (oy + y * G) * K }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.beginPath(); ctx.rect(0, 0, ctx.canvas.width, cutY * K); ctx.clip();
  for (const l of L) { ctx.save(); ctx.globalAlpha = rimA; ctx.filter = `blur(${14 * K}px)`; ctx.drawImage(l.r, l.x + 5 * K, l.y - 4 * K); ctx.restore(); }
  for (const i of GROUP_ORDER) ctx.drawImage(L[i].c, L[i].x, L[i].y);
  ctx.restore();
}

// ---------- week 2 video kit: women's futevôlei footage, beat grids, karaoke captions ----------
const FR2 = '../sandwalk-voidfem/frames/';
// clips from the client's women's futevôlei videos (prep_vf1.sh); o2 is left out (third-party brand on a shirt)
const CLIPS = { h1: 36, h2: 34, h3: 34, h4: 33, m1: 34, m10: 33, m2: 33, m3: 17, m4: 23, m5: 33, m6: 33, m7: 30, m8: 30, m9: 36,
                o1: 48, o3: 41, x1: 26, x2: 22, x3: 31, x4: 30 };
// beat grids, time 0 = first sample of the track as used in the mix (v02 from 0.30 s, bipolar from 0)
const TRK = { v02: { beat: 0.4615, ph: 0.416 }, bip: { beat: 0.5714, ph: 0.10 } };
const beatAt = (tr, k) => TRK[tr].ph + k * TRK[tr].beat;
// cut times every `every` beats from t0 to t1
function cutGrid(tr, every, t0, t1) { const out = []; for (let k = 0; ; k++) { const t = beatAt(tr, k * every); if (t >= t1) break; if (t >= t0) out.push(t); } return out; }
// Footage montage. cuts = sorted cut times (the first one ≤ 0 or 0); seq = [clip, startFrac] per segment.
// A clip shorter than its segment is slowed down to fit (speed ramp); every cut gets a punch-in and a soft flash.
async function montage(t, cuts, seq, { dim = 0, blur = 0, zoom = 1.04, punch = 0.07, flashA = 0.16, ay = 1000 } = {}) {
  let k = 0; while (k + 1 < cuts.length && t >= cuts[k + 1]) k++;
  const t0 = cuts[k], t1 = k + 1 < cuts.length ? cuts[k + 1] : t0 + 2, [name, f0] = seq[k % seq.length], n = CLIPS[name];
  const start = 1 + f0 * (n - 1), avail = (n - start) / 30, seg = t1 - t0, sp = Math.min(1, avail / seg);
  const f = start + (t - t0) * 30 * sp, z = zoom * (1 + punch * (1 - eout(Math.min(1, (t - t0) / 0.35))));
  await drawFrame(FR2 + name, n, f, { z, ay, filter: `contrast(1.05) saturate(1.06) brightness(${1 - dim})${blur ? ` blur(${blur}px)` : ''}` });
  if (t - t0 < 0.14 && k > 0) { ctx.fillStyle = `rgba(255,255,255,${flashA * (1 - (t - t0) / 0.14)})`; ctx.fillRect(0, 0, W, H); }
  return k;
}
// karaoke captions from a make_vo.py timing list; strip centred at y (inside the Reels safe area)
function captions(t, VO, y = 1190, maxW = 880, fs = 46) {
  const line = VO.find(l => t >= l.s - 0.05 && t <= l.e + 0.25); if (!line) return;
  const words = line.w.map(w => w.w), font = `800 ${fs}px Inter`, lh = fs * 1.3; ctx.font = font; const sp = ctx.measureText(' ').width;
  const rows = [[]]; let ws = 0;
  words.forEach((w, i) => { const ww = ctx.measureText(w).width; if (ws + ww > maxW && rows[rows.length - 1].length) { rows.push([]); ws = 0; } rows[rows.length - 1].push(i); ws += ww + sp; });
  const y0 = y - (rows.length - 1) * lh / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(540 - maxW / 2 - 30, y0 - fs * 1.08, maxW + 60, rows.length * lh + fs * 0.74, 18); ctx.fill();
  rows.forEach((r, ri) => {
    ctx.font = font; const tw = r.reduce((a, i) => a + ctx.measureText(words[i]).width, 0) + sp * (r.length - 1); let x = 540 - tw / 2;
    r.forEach(i => { const on = t >= line.w[i].s - 0.03, cur = on && t <= line.w[i].e + 0.05;
      txt(words[i], x, y0 + ri * lh, font, cur ? YEL : on ? WHITE : 'rgba(255,255,255,0.35)'); ctx.font = font; x += ctx.measureText(words[i]).width + sp; });
  });
}
const LNS = VO => Object.fromEntries(VO.map(l => [l.k, l]));
const wordT = (L, k, i) => L[k].w[Math.min(i, L[k].w.length - 1)].s;
// a kit card (dark rounded card + studio-lit kit + optional label), scaled by s around its centre
function kitCard(k, cx, cy, w, h, s = 1, { label = true, hi = false, alpha = 1 } = {}) {
  if (s <= 0.01 || alpha <= 0.01) return;
  scaled(cx, cy, s, alpha, () => {
    ctx.save(); if (hi) { ctx.shadowColor = 'rgba(255,204,41,0.5)'; ctx.shadowBlur = 40; }
    ctx.fillStyle = 'rgba(14,14,14,0.92)'; ctx.strokeStyle = hi ? YEL : 'rgba(255,255,255,0.14)'; ctx.lineWidth = hi ? 4 : 2;
    ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 24); ctx.fill(); ctx.stroke(); ctx.restore();
    kit(k, cx, cy - (label ? h * 0.06 : 0), Math.min(w, h) * 0.86, 0, { spot: 0.26 });
    if (label) txt(KIT_NAME[k].toUpperCase(), cx, cy + h / 2 - 26, '800 28px Inter', hi ? YEL : WHITE, 'center');
  });
}
function priceLine(cx, y, s = 1, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.font = `600 ${36 * s}px Inter`; const aa = 'de ' + OFF.from, aw = ctx.measureText(aa).width;
  ctx.font = `700 ${70 * s}px Syne`; const b = 'por ' + OFF.to, bw = ctx.measureText(b).width, x0 = cx - (aw + 24 * s + bw) / 2;
  strike(aa, x0, y, `600 ${36 * s}px Inter`, '#BDBDBD', '#E0E0E0'); glowTxt(b, x0 + aw + 24 * s, y + 2, `700 ${70 * s}px Syne`, YEL, 30, 0.5);
  ctx.restore();
}
function medal(x, y, n, r = 38) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16 * FX;
  ctx.fillStyle = n === 1 ? YEL : n === 2 ? '#D9D9D9' : '#E0A36B'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  txt(n + 'º', x, y + 3, `700 ${r * 0.9}px Syne`, INK, 'center', 'middle');
}
