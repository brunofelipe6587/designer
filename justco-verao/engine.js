// Shared canvas engine for the Just Co 9:16 edits. Each page defines SEGMENTS (timeline → raw-footage mapping),
// DUR and an overlay(t) function; render_video.js calls window.renderAt(t) frame by frame.
// Raw frames: build/vf/0001.jpg … (1080x1920, 30 fps, graded at extraction).
const W = 1080, H = 1920, FPS_RAW = 30, N_RAW = 488;
const C = { ink: '#111111', paper: '#F3EFE8', sand: '#E6DCCB', cobalt: '#1E3FB8', orange: '#E2552B', white: '#FFFFFF' };
const F = { display: '"Bebas Neue"', sans: 'Inter', serif: '"Playfair Display"' };
const ctx = document.getElementById('c').getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eout = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const prog = (t, a, b) => clamp((t - a) / (b - a));

const loadImg = src => new Promise((ok, er) => { const i = new Image(); i.onload = () => ok(i); i.onerror = er; i.src = src; });
const IMG = {};
const frameCache = new Map();
async function frame(rawT) {
  const n = clamp(Math.round(rawT * FPS_RAW) + 1, 1, N_RAW);
  if (!frameCache.has(n)) {
    frameCache.set(n, await loadImg(`build/vf/${String(n).padStart(4, '0')}.jpg`));
    if (frameCache.size > 24) frameCache.delete(frameCache.keys().next().value);
  }
  return frameCache.get(n);
}

// Draw raw footage at zoom z around focus (fx, fy) in 0..1 image space, never exposing the edges.
async function drawRaw(rawT, z = 1, fx = 0.5, fy = 0.5) {
  const img = await frame(rawT);
  fx = clamp(fx, 0.5 / z, 1 - 0.5 / z); fy = clamp(fy, 0.5 / z, 1 - 0.5 / z);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-fx * W, -fy * H);
  ctx.drawImage(img, 0, 0, W, H); ctx.restore();
}

// Segment-driven background: { t0, t1, r0, r1, z0, z1, fx, fy, fx1, fy1 }; a short punch-in on every cut.
async function drawSegments(t, segs) {
  const s = segs.find(s => t >= s.t0 && t < s.t1) || segs[segs.length - 1];
  const p = prog(t, s.t0, s.t1);
  const punch = 1 + 0.05 * (1 - eout(prog(t, s.t0, s.t0 + 0.35)));
  const z = lerp(s.z0, s.z1, eio(p)) * punch;
  await drawRaw(lerp(s.r0, s.r1, p), z, lerp(s.fx, s.fx1 ?? s.fx, eio(p)), lerp(s.fy, s.fy1 ?? s.fy, eio(p)));
}

function shade(top = 0.45, bottom = 0.0, mid = 0.0) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(0,0,0,${top})`); g.addColorStop(0.42, `rgba(0,0,0,${mid})`);
  g.addColorStop(0.7, `rgba(0,0,0,${mid})`); g.addColorStop(1, `rgba(0,0,0,${bottom})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// Text with a rise-and-unmask reveal; p in 0..1, out in 0..1 fades/lifts away.
function txt(str, x, y, o = {}) {
  const { font = F.display, size = 120, weight = 400, italic = false, color = C.white, align = 'left',
    ls = 0, p = 1, out = 0, shadow = 0.35, rise = 40 } = o;
  if (p <= 0 || out >= 1) return;
  ctx.save();
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${font}`;
  ctx.letterSpacing = `${ls}px`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const e = eout(p), m = ctx.measureText(str);
  const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
  ctx.globalAlpha = (1 - out) * clamp(p * 1.6);
  ctx.beginPath(); ctx.rect(0, y - asc - 20 - out * 30, W, asc + desc + 40); ctx.clip();
  if (shadow) { ctx.shadowColor = `rgba(0,0,0,${shadow})`; ctx.shadowBlur = 30; ctx.shadowOffsetY = 4; }
  ctx.fillStyle = color; ctx.fillText(str, x, y + (1 - e) * (asc + rise) - out * 30);
  ctx.restore();
  return m.width;
}

// Bottom band for lower-third text: transparent until y0, `a` alpha by y1 and below.
function lowShade(a = 0.7, y0 = 900, y1 = 1550) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0);
}

function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function pill(str, x, y, o = {}) {
  const { size = 30, bg = C.white, color = C.ink, p = 1, out = 0, padX = 30, h = 72, check = false, weight = 700, ls = 2.5 } = o;
  if (p <= 0 || out >= 1) return;
  ctx.save();
  ctx.font = `${weight} ${size}px ${F.sans}`; ctx.letterSpacing = `${ls}px`;
  const icon = check ? 44 : 0, w = ctx.measureText(str).width + padX * 2 + icon;
  const e = eback(clamp(p));
  ctx.globalAlpha = clamp(p * 2) * (1 - out);
  ctx.translate(x + (1 - e) * -60, y);
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
  rrect(0, 0, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
  if (check) {
    ctx.beginPath(); ctx.arc(padX + 14, h / 2, 16, 0, Math.PI * 2); ctx.fillStyle = C.orange; ctx.fill();
    ctx.beginPath(); ctx.moveTo(padX + 6, h / 2); ctx.lineTo(padX + 12, h / 2 + 6); ctx.lineTo(padX + 23, h / 2 - 6);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.fillText(str, padX + icon, h / 2 + 2);
  ctx.restore();
}

function button(str, cx, y, t, o = {}) {
  const { bg = C.orange, color = C.white, w = 640, h = 112, p = 1 } = o;
  if (p <= 0) return;
  const pulse = 1 + 0.035 * Math.max(0, Math.sin((t * 2.4) * Math.PI * 2)) * clamp(p);
  ctx.save(); ctx.globalAlpha = clamp(p * 2);
  ctx.translate(cx, y + h / 2 + (1 - eout(p)) * 40); ctx.scale(pulse, pulse);
  ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
  rrect(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.font = `800 36px ${F.sans}`; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(str, 0, 3);
  ctx.restore();
}

function coupon(cx, y, p, o = {}) {
  const { color = C.white, w = 620, h = 170, label = 'NA 1ª COMPRA · CUPOM', code = 'THEFIRST' } = o;
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(cx, y + (1 - eout(p)) * 30);
  ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.strokeStyle = color;
  rrect(-w / 2, 0, w, h, 22); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = color; ctx.textAlign = 'center';
  ctx.font = `600 24px ${F.sans}`; ctx.letterSpacing = '6px'; ctx.fillText(label, 0, 52);
  ctx.font = `400 96px ${F.display}`; ctx.letterSpacing = '8px'; ctx.fillText(code, 0, 140);
  ctx.restore();
}

function logo(x, y, h, alpha = 1, img = IMG.logoW) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(img, x, y, h * img.width / img.height, h); ctx.restore();
}

async function boot(extra = {}) {
  await document.fonts.load(`400 100px ${F.display}`); await document.fonts.load(`italic 500 100px ${F.serif}`);
  await document.fonts.load(`800 40px ${F.sans}`); await document.fonts.load(`600 40px ${F.sans}`); await document.fonts.load(`500 40px ${F.sans}`); await document.fonts.load(`700 40px ${F.sans}`);
  IMG.logoW = await loadImg('assets/logo_white.svg'); IMG.logoB = await loadImg('assets/logo_black.svg');
  for (const [k, v] of Object.entries(extra)) IMG[k] = await loadImg(v);
}
