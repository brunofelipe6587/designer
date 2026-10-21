// Shared look and safe-zone layout for the Kayla Atacado creatives (9:16, 1080×1920).
// Meta Reels/Stories safe zone: keep text, prices, logos, buttons and highlights out of the top 14% (270 px),
// the bottom 35% (670 px) and 6% (65 px) on each side, where the app's own UI sits. Photos and footage may bleed
// into those margins; anything the viewer must read stays inside SAFE.
const W = 1080, H = 1920;
const SAFE = { top: 270, bottom: 1250, side: 65 };
const ctx = document.getElementById('c').getContext('2d');
const C = { beige2: '#D8CABD', ink: '#211C19', cream: '#F7E8DA', mute: '#6E625A', line: 'rgba(33,28,25,0.22)', green: '#3E6B4A' };
const SERIF = '"Playfair Display", serif', COND = 'Oswald, sans-serif', SANS = 'Montserrat, sans-serif';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eout = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const prog = (t, a, b) => clamp((t - a) / (b - a));
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');

// ---------- sources ----------
const IMG = {};
const load = (n, s) => new Promise((ok, er) => { const i = new Image(); i.onload = () => { IMG[n] = i; ok(); }; i.onerror = er; i.src = s; });
const cache = new Map();
function frame(dir, n, max) {
  n = clamp(n, 1, max); const k = dir + n;
  if (!cache.has(k)) { const im = new Image(); im.src = `frames/${dir}/${String(n).padStart(5, '0')}.jpg`; cache.set(k, im.decode().then(() => im)); if (cache.size > 60) cache.delete(cache.keys().next().value); }
  return cache.get(k);
}
const tela = s => frame('tela', Math.floor(s * 30) + 1, 5656);
async function loadFonts() {
  for (const f of ['700 40px Oswald', '500 40px Oswald', '400 40px "Playfair Display"', '500 40px "Playfair Display"', 'italic 400 40px "Playfair Display"', '500 40px Montserrat', '600 40px Montserrat']) await document.fonts.load(f);
  await document.fonts.ready;
}

// ---------- drawing helpers ----------
function cover(img, x, y, w, h, fx = 0.5, fy = 0.5, zoom = 1, c = ctx) {
  const r = Math.max(w / img.width, h / img.height) * zoom, sw = w / r, sh = h / r;
  c.drawImage(img, (img.width - sw) * fx, (img.height - sh) * fy, sw, sh, x, y, w, h);
}
function studio() {
  const g = ctx.createRadialGradient(540, 760, 120, 540, 960, 1250);
  g.addColorStop(0, '#EEE5DC'); g.addColorStop(1, C.beige2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  lettering();
}
// faint repeated KAYLA, like the lettering on the store's window glass; decorative only, it fills the bottom
// margin (under the app UI in Reels, still visible in the 4:5 feed crop) and carries nothing to read
function lettering() {
  ctx.save(); ctx.fillStyle = 'rgba(33,28,25,0.04)'; ctx.font = `700 132px ${COND}`; ctx.letterSpacing = '18px'; ctx.textAlign = 'left';
  for (let r = 0; r < 5; r++) {
    const y = 1395 + r * 150, x0 = r % 2 ? -260 : -40;
    for (let x = x0; x < W; x += 560) ctx.fillText('KAYLA', x, y);
  }
  ctx.restore();
}
function typed(str, t, at, dur) { return str.slice(0, Math.floor(clamp((t - at) / dur) * str.length + 0.0001)); }
function shadowText(fn) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.32)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 3; fn(); ctx.restore(); }
function logo(x, y, w, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.logo, x - w / 2, y, w, w * 76 / 196); ctx.restore(); }
function label(str, x, y, color = C.mute, size = 28, align = 'center') {
  ctx.save(); ctx.fillStyle = color; ctx.font = `600 ${size}px ${SANS}`; ctx.letterSpacing = '6px'; ctx.textAlign = align;
  ctx.fillText(str, align === 'center' ? x + 3 : x, y); ctx.restore();
}
// a photo that melts into the studio background below `fadeFrom` (alpha mask, no seam)
const OFF = Object.assign(document.createElement('canvas'), { width: 1080, height: 1400 });
function fadePhoto(img, h, fy, zoom, fadeFrom, fx = 0.5) {
  const oc = OFF.getContext('2d'); oc.globalCompositeOperation = 'source-over'; oc.clearRect(0, 0, W, OFF.height);
  cover(img, 0, 0, W, h, fx, fy, zoom, oc);
  const g = oc.createLinearGradient(0, fadeFrom, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.6, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  oc.globalCompositeOperation = 'destination-out'; oc.fillStyle = g; oc.fillRect(0, fadeFrom, W, h - fadeFrom + 2);
  ctx.drawImage(OFF, 0, 0, W, h, 0, 0, W, h);
}
// darkening behind text that sits over footage, centred on the band where the text is
function scrim(y0, y1, a = 0.55) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(20,14,10,0)'); g.addColorStop(0.5, `rgba(20,14,10,${a})`); g.addColorStop(1, 'rgba(20,14,10,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
}

// ---------- shared scenes ----------
// Hook: "LOJISTA" on screen from frame 0 (segments the audience and stops the scroll), a serif line, and optionally
// the brand's callout (thin box + stem + dot). All inside the safe zone.
function hookText(t, line2, callout, y = { lojista: 490, line2: 590 }) {
  const g = ctx.createLinearGradient(0, 0, 0, 1150); g.addColorStop(0, 'rgba(30,20,15,0.55)'); g.addColorStop(1, 'rgba(30,20,15,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1150);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadowText(() => {
    ctx.fillStyle = C.cream; ctx.font = `700 186px ${COND}`; ctx.letterSpacing = '4px';
    ctx.fillText('LOJISTA', 542, y.lojista);
    ctx.letterSpacing = '0px'; ctx.fillStyle = '#fff'; ctx.font = `400 ${line2.length > 22 ? 62 : 72}px ${SERIF}`;
    ctx.fillText(typed(line2, t, 0.15, 0.7), 540, y.line2);
  });
  if (callout) {
    const bx = eout(prog(t, 1.2, 1.55)), stem = eout(prog(t, 1.45, 1.8));
    if (bx > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3;
      const w = Math.min(860, 120 + callout.length * 26) * bx; ctx.strokeRect(540 - w / 2, 660, w, 110);
      ctx.beginPath(); ctx.moveTo(540, 770); ctx.lineTo(540, 770 + 130 * stem); ctx.stroke();
      if (stem >= 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(540, 912, 13, 0, Math.PI * 2); ctx.fill(); }
      shadowText(() => { ctx.fillStyle = '#fff'; ctx.font = `500 46px ${SANS}`; ctx.fillText(typed(callout, t, 1.5, 0.7), 540, 731); });
    }
  }
  ctx.restore();
}
// Step caption at the top of the safe zone: small tracked label, serif title, optional progress dots.
function stepCaption(lab, title, l, dots) {
  const a = eout(prog(l, 0, 0.4)), dy = (1 - a) * 20;
  ctx.save(); ctx.globalAlpha *= a; ctx.textAlign = 'center';
  label(lab, 540, 340 + dy, C.mute, 28);
  ctx.fillStyle = C.ink; ctx.font = `400 ${title.length > 22 ? 62 : 70}px ${SERIF}`; ctx.fillText(title, 540, 428 + dy);
  ctx.restore();
  if (dots) for (let i = 0; i < dots[1]; i++) {
    const x = 540 + (i - (dots[1] - 1) / 2) * 34;
    ctx.fillStyle = i <= dots[0] ? C.ink : C.line; ctx.beginPath(); ctx.arc(x, 470, i === dots[0] ? 8 : 6, 0, Math.PI * 2); ctx.fill();
  }
}
// The phone, shown large and panned so the part of the screen that matters (`focus`, a fraction of screen height) is
// centred in the safe zone (y 525–1250). It is cut under the caption and runs on past the bottom margin, where only
// the less important rest of the screen sits.
const WIN = { y0: 525, y1: 1250 };
let panFocus = null;
function phoneWindow(img, focus, hl, rise = 1) {
  const sw = 700, sh = sw * 1280 / 576, bz = 20, r = 72, cx = 540, mid = (WIN.y0 + WIN.y1) / 2;
  let cy = mid - (focus - 0.5) * sh;
  cy = clamp(cy, WIN.y1 - sh / 2 + 20, WIN.y0 + sh / 2 - 20) + (1 - rise) * 220;
  ctx.save(); ctx.globalAlpha *= clamp(rise * 1.4);
  ctx.beginPath(); ctx.rect(0, WIN.y0 - 30, W, H); ctx.clip();
  ctx.shadowColor = 'rgba(40,25,15,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#141211'; ctx.beginPath(); ctx.roundRect(cx - sw / 2 - bz, cy - sh / 2 - bz, sw + 2 * bz, sh + 2 * bz, r); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save(); ctx.beginPath(); ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, r - bz); ctx.clip();
  if (img) ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
  if (hl) {
    const [y0, y1, p] = hl, yy = cy - sh / 2 + sh * y0, hh = sh * (y1 - y0);
    ctx.strokeStyle = `rgba(33,28,25,${p})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(cx - sw / 2 + 10, yy - 6, sw - 20, hh + 12, 14); ctx.stroke();
  }
  ctx.restore(); ctx.restore();
  // soft fade where the caption area cuts the phone, back into the studio colour
  const g = ctx.createLinearGradient(0, WIN.y0 - 30, 0, WIN.y0 + 40); g.addColorStop(0, 'rgba(234,225,215,1)'); g.addColorStop(1, 'rgba(234,225,215,0)');
  ctx.fillStyle = g; ctx.fillRect(0, WIN.y0 - 30, W, 70);
}
// End card: photo bleeding into the top margin, then logo, slogan, the 3 steps, grade/shipping line and the button,
// all between y 270 and 1250.
function endCard(t, t0, dur, img, fy = 0.12, fx = 0.5) {
  studio();
  fadePhoto(img, 720, fy, 1.02 + 0.02 * prog(t, t0, t0 + dur), 380, fx);
  logo(540, 515, 230);
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.font = `500 62px ${SERIF}`; ctx.fillText('Peças que giram.', 540, 732);
  ctx.font = `italic 400 62px ${SERIF}`; ctx.fillText('Margem que vale.', 540, 802);
  ctx.fillStyle = C.line; ctx.fillRect(400, 834, 280, 2); ctx.restore();
  const rows = [['1', 'Cadastre seu CNPJ ativo no site'], ['2', 'Aprovação automática'], ['3', 'Compre a partir de 6 peças']];
  rows.forEach(([n, s], i) => {
    const ra = eout(prog(t, t0 + 0.6 + i * 0.45, t0 + 1.2 + i * 0.45)), y = 905 + i * 70;
    ctx.save(); ctx.globalAlpha *= ra; ctx.translate((1 - ra) * 24, 0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(205, y - 13, 28, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.font = `500 32px ${SERIF}`; ctx.fillText(n, 205, y - 2);
    ctx.textAlign = 'left'; ctx.font = `500 38px ${SANS}`; ctx.fillText(s, 258, y);
    ctx.restore();
  });
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = C.mute; ctx.font = `600 24px ${SANS}`; ctx.letterSpacing = '4px';
  ctx.fillText('GRADE 42 AO 54 · ENVIAMOS PARA TODO O BRASIL', 542, 1112); ctx.restore();
  const b = eout(prog(t, t0 + 2.1, t0 + 2.6));
  ctx.save(); ctx.globalAlpha *= b; ctx.translate(540, 1192);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-380, -46, 760, 92, 46); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `600 34px ${SANS}`; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('VER PREÇOS DE ATACADO', 0, 2);
  ctx.restore();
}
// Debug aid: ?safe in the URL draws the safe-zone limits.
function safeGuides() {
  if (!location.search.includes('safe')) return;
  ctx.save(); ctx.strokeStyle = 'rgba(255,0,0,0.8)'; ctx.lineWidth = 3; ctx.setLineDash([16, 10]);
  ctx.strokeRect(SAFE.side, SAFE.top, W - 2 * SAFE.side, SAFE.bottom - SAFE.top); ctx.restore();
}
