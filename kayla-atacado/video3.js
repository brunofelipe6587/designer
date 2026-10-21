// Creative 3 — "A conta da lojista": wholesale prices of three best sellers, then the 6-piece minimum order added up.
// Version A (window.VERSION = 'a') sets each price beside the brand's own retail price (kaylastore.com.br, full price);
// version B shows wholesale prices only. Prices as of 21/10/2026. No voice; the brand's reel music, as in creative 2.
// Evergreen: no season, no collection or product names (garment type only).
const V = window.VERSION || 'a';
const W = 1080, H = 1920, DUR = 27.4;
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

// paced for reading: 8 beats per scene (16 for the math), beat 0.395 s, so changes land on the music
const BEAT = 0.395, B = [8, 16, 24, 32, 48].map(k => k * BEAT); // hook | 3 products | the math | site
const CARD = 56 * BEAT;
const PRODUCTS = [ // garment, wholesale, wholesale via PIX (as the site shows it), retail full price at the brand's own store
  { img: 'eve', type: 'BLUSA', w: 79.90, pix: 75.91, r: 219.90, fy: 0.16 },
  { img: 'bruna2', type: 'REGATA', w: 59.90, pix: 56.91, r: 139.90, fy: 0.12 },
  { img: 'maria', type: 'BLUSA', w: 59.90, pix: 56.91, r: 139.90, fy: 0.12 },
];
const GRID = [['eve', 79.90], ['eve2', 79.90], ['bruna', 59.90], ['bruna3', 59.90], ['maria', 59.90], ['maria3', 59.90]];
const TOTAL_W = 399.40, TOTAL_R = 999.40, TOTAL_PIX = 379.43;

// ---------- sources ----------
const cache = new Map();
function frame(dir, n, max) {
  n = clamp(n, 1, max); const k = dir + n;
  if (!cache.has(k)) { const im = new Image(); im.src = `frames/${dir}/${String(n).padStart(5, '0')}.jpg`; cache.set(k, im.decode().then(() => im)); if (cache.size > 60) cache.delete(cache.keys().next().value); }
  return cache.get(k);
}
const tela = s => frame('tela', Math.floor(s * 30) + 1, 5656);
const IMG = {};
const OFF = Object.assign(document.createElement('canvas'), { width: 1080, height: 1300 });
const load = (n, s) => new Promise((ok, er) => { const i = new Image(); i.onload = () => { IMG[n] = i; ok(); }; i.onerror = er; i.src = s; });

// ---------- helpers ----------
function cover(img, x, y, w, h, fx = 0.5, fy = 0.5, zoom = 1, c = ctx) {
  const r = Math.max(w / img.width, h / img.height) * zoom, sw = w / r, sh = h / r;
  c.drawImage(img, (img.width - sw) * fx, (img.height - sh) * fy, sw, sh, x, y, w, h);
}
function studio() {
  const g = ctx.createRadialGradient(540, 760, 120, 540, 960, 1250);
  g.addColorStop(0, '#EEE5DC'); g.addColorStop(1, C.beige2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// photo on top that melts into the studio background (alpha mask, no seam)
function topPhoto(img, h, fy, zoom, fadeFrom) {
  const oc = OFF.getContext('2d'); oc.globalCompositeOperation = 'source-over'; oc.clearRect(0, 0, W, OFF.height);
  cover(img, 0, 0, W, h, 0.5, fy, zoom, oc);
  const g = oc.createLinearGradient(0, fadeFrom, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.6, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  oc.globalCompositeOperation = 'destination-out'; oc.fillStyle = g; oc.fillRect(0, fadeFrom, W, h - fadeFrom + 2);
  ctx.drawImage(OFF, 0, 0, W, h, 0, 0, W, h);
}
function typed(str, t, at, dur) { return str.slice(0, Math.floor(clamp((t - at) / dur) * str.length + 0.0001)); }
function shadowText(fn) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 3; fn(); ctx.restore(); }
function logo(x, y, w, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.logo, x - w / 2, y, w, w * 76 / 196); ctx.restore(); }
function label(str, x, y, color = C.mute, size = 28, align = 'center') {
  ctx.save(); ctx.fillStyle = color; ctx.font = `600 ${size}px ${SANS}`; ctx.letterSpacing = '6px'; ctx.textAlign = align;
  ctx.fillText(str, align === 'center' ? x + 3 : x, y); ctx.restore();
}
function phone(img, cx, cy, sw) {
  const sh = sw * 1280 / 576, bz = 18, r = 64;
  ctx.save();
  ctx.shadowColor = 'rgba(40,25,15,0.35)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
  ctx.fillStyle = '#141211'; ctx.beginPath(); ctx.roundRect(cx - sw / 2 - bz, cy - sh / 2 - bz, sw + 2 * bz, sh + 2 * bz, r); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, r - bz); ctx.clip();
  ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
  ctx.restore();
}

// ---------- scenes ----------
function hook(t) {
  cover(IMG.hook, 0, 0, W, H, 0.5, 0.15, 1.04 + 0.04 * prog(t, 0, B[0]));
  const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, 'rgba(30,20,15,0.5)'); g.addColorStop(1, 'rgba(30,20,15,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1100);
  ctx.textAlign = 'center';
  shadowText(() => {
    ctx.fillStyle = C.cream; ctx.font = `700 196px ${COND}`; ctx.letterSpacing = '4px';
    ctx.fillText('LOJISTA', 540, 400); // on screen from frame 0: segments the audience and stops the scroll
    ctx.letterSpacing = '0px'; ctx.fillStyle = '#fff'; ctx.font = `400 76px ${SERIF}`;
    ctx.fillText(typed('quanto custa começar?', t, 0.15, 0.7), 540, 505);
  });
  const bx = eout(prog(t, 1.5, 1.85)), stem = eout(prog(t, 1.75, 2.1));
  if (bx > 0) { // the brand's callout: thin box + stem + dot
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3;
    const w = 640 * bx; ctx.strokeRect(540 - w / 2, 600, w, 110);
    ctx.beginPath(); ctx.moveTo(540, 710); ctx.lineTo(540, 710 + 140 * stem); ctx.stroke();
    if (stem >= 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(540, 862, 13, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.font = `500 50px ${SANS}`; ctx.fillText(typed('Faça a conta com a gente', t, 1.8, 0.65), 540, 672);
    ctx.restore();
  }
}
function product(t, k) {
  const p = PRODUCTS[k], at = B[k], l = t - at;
  studio();
  topPhoto(IMG[p.img], 1300, p.fy, 1.03 + 0.04 * prog(t, at, at + 3.4), 940);
  const a = eout(prog(l, 0.1, 0.5));
  ctx.save(); ctx.globalAlpha *= a;
  label(`${p.type} · GRADE 42 AO 54`, 540, 1340);
  ctx.restore();
  if (V === 'a') {
    // two columns: wholesale (big, ink) → the brand's retail price (lighter)
    const a1 = eout(prog(l, 0.35, 0.75)), a2 = eout(prog(l, 1.15, 1.55));
    ctx.save(); ctx.globalAlpha *= a1; ctx.translate(0, (1 - a1) * 26);
    label('NO ATACADO', 275, 1460, C.mute, 26); ctx.fillStyle = C.ink; ctx.font = `700 112px ${COND}`; ctx.textAlign = 'center'; ctx.fillText(brl(p.w), 275, 1595);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= a2; ctx.translate((1 - a2) * 40, 0);
    ctx.fillStyle = C.mute; ctx.font = `400 64px ${SERIF}`; ctx.textAlign = 'center'; ctx.fillText('→', 548, 1566);
    label('NA LOJA KAYLA', 815, 1460, C.mute, 26); ctx.fillStyle = C.mute; ctx.font = `500 92px ${COND}`; ctx.fillText(brl(p.r), 815, 1590);
    ctx.restore();
    const a3 = eout(prog(l, 1.85, 2.25));
    ctx.save(); ctx.globalAlpha *= a3; ctx.fillStyle = C.ink; ctx.font = `italic 400 50px ${SERIF}`; ctx.textAlign = 'center';
    ctx.fillText('a mesma peça no varejo da marca', 540, 1720); ctx.restore();
  } else {
    const a1 = eout(prog(l, 0.35, 0.75)), a2 = eout(prog(l, 1.3, 1.7));
    ctx.save(); ctx.globalAlpha *= a1; ctx.translate(0, (1 - a1) * 26);
    label('NO ATACADO', 540, 1460, C.mute, 28); ctx.fillStyle = C.ink; ctx.font = `700 160px ${COND}`; ctx.textAlign = 'center'; ctx.fillText(brl(p.w), 540, 1640);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= a2; ctx.fillStyle = C.ink; ctx.font = `italic 400 50px ${SERIF}`; ctx.textAlign = 'center';
    ctx.fillText(`${brl(p.pix)} no PIX`, 540, 1740); ctx.restore();
  }
}
function math(t) {
  const at = B[3], l = t - at;
  studio(); logo(540, 70, 170, 0.85);
  const a = eout(prog(l, 0, 0.4));
  ctx.save(); ctx.globalAlpha *= a; ctx.textAlign = 'center';
  ctx.fillStyle = C.ink; ctx.font = `400 64px ${SERIF}`; ctx.fillText('Seu pedido mínimo:', 540, 250);
  ctx.font = `700 120px ${COND}`; ctx.letterSpacing = '3px'; ctx.fillText('6 PEÇAS', 540, 380); ctx.letterSpacing = '0px';
  ctx.restore();
  // 3×2 grid of the pieces, popping in one by one
  const tw = 270, th = 340, gx = 34, gy = 74, x0 = 540 - (3 * tw + 2 * gx) / 2, y0 = 450;
  GRID.forEach(([n, price], i) => {
    const p = eback(prog(l, 0.5 + i * 0.3, 0.9 + i * 0.3)); if (p <= 0) return;
    const x = x0 + (i % 3) * (tw + gx), y = y0 + Math.floor(i / 3) * (th + gy);
    ctx.save(); ctx.translate(x + tw / 2, y + th / 2); ctx.scale(p, p);
    ctx.shadowColor = 'rgba(40,25,15,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-tw / 2 - 8, -th / 2 - 8, tw + 16, th + 16, 18); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.roundRect(-tw / 2, -th / 2, tw, th, 12); ctx.clip();
    cover(IMG[n], -tw / 2, -th / 2, tw, th, 0.5, 0.15);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= clamp(p); ctx.fillStyle = C.ink; ctx.font = `600 30px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText(brl(price), x + tw / 2, y + th + 48); ctx.restore();
  });
  // totals, counting up
  const c1 = prog(l, 2.6, 3.5), c2 = prog(l, 4.0, 4.9);
  if (c1 > 0) {
    ctx.save(); ctx.globalAlpha *= eout(prog(l, 2.6, 2.95)); ctx.textAlign = 'center';
    label('VOCÊ INVESTE', 540, 1395, C.mute, 28);
    ctx.fillStyle = C.ink; ctx.font = `700 140px ${COND}`; ctx.fillText(brl(TOTAL_W * eout(c1)), 540, 1545);
    ctx.restore();
  }
  if (c2 > 0) {
    ctx.save(); ctx.globalAlpha *= eout(prog(l, 4.0, 4.35)); ctx.textAlign = 'center';
    if (V === 'a') {
      ctx.fillStyle = C.ink; ctx.font = `italic 400 52px ${SERIF}`; ctx.fillText('na loja Kayla, essas 6 peças somam', 540, 1650);
      ctx.fillStyle = C.green; ctx.font = `700 110px ${COND}`; ctx.fillText(brl(TOTAL_R * eout(c2)), 540, 1785);
    } else {
      ctx.fillStyle = C.ink; ctx.font = `italic 400 56px ${SERIF}`; ctx.fillText(`ou ${brl(TOTAL_PIX)} no PIX`, 540, 1660);
      label('CORES E TAMANHOS VARIADOS', 540, 1760, C.mute, 26);
    }
    ctx.restore();
  }
}
async function site(t) {
  const at = B[4], l = t - at;
  studio(); logo(540, 82, 200, 0.9);
  const a = eout(prog(l, 0, 0.4)), dy = (1 - a) * 22;
  ctx.save(); ctx.globalAlpha *= a; ctx.textAlign = 'center';
  label('TODOS OS PREÇOS NO SITE', 540, 228 + dy, C.mute, 30);
  ctx.fillStyle = C.ink; ctx.font = `400 72px ${SERIF}`; ctx.fillText('Cadastre seu CNPJ', 540, 318 + dy);
  ctx.restore();
  phone(await tela(69.8 + l * 0.12), 540, lerp(1500, 1170, eout(prog(l, 0, 0.6))), 580);
}
function card(t) {
  studio();
  topPhoto(IMG.card, 820, 0.1, 1.02 + 0.02 * prog(t, CARD, DUR), 440);
  logo(540, 815, 270);
  ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.font = `500 74px ${SERIF}`; ctx.fillText('Peças que giram.', 540, 1035);
  ctx.font = `italic 400 74px ${SERIF}`; ctx.fillText('Margem que vale.', 540, 1118);
  ctx.fillStyle = C.line; ctx.fillRect(390, 1158, 300, 2);
  const rows = [['1', 'Cadastre seu CNPJ ativo no site'], ['2', 'Aprovação automática'], ['3', 'Compre a partir de 6 peças']];
  rows.forEach(([n, s], i) => {
    const ra = eout(prog(t, CARD + 0.6 + i * 0.45, CARD + 1.2 + i * 0.45)), y = 1255 + i * 96;
    ctx.save(); ctx.globalAlpha *= ra; ctx.translate((1 - ra) * 24, 0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(170, y - 16, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.font = `500 38px ${SERIF}`; ctx.fillText(n, 170, y - 3);
    ctx.textAlign = 'left'; ctx.font = `500 42px ${SANS}`; ctx.fillText(s, 236, y);
    ctx.restore();
  });
  ctx.textAlign = 'center'; ctx.fillStyle = C.mute; ctx.font = `600 27px ${SANS}`; ctx.letterSpacing = '5px';
  ctx.fillText('GRADE 42 AO 54 · ENVIAMOS PARA TODO O BRASIL', 542, 1580); ctx.letterSpacing = '0px';
  const b = eout(prog(t, CARD + 2.1, CARD + 2.6));
  ctx.save(); ctx.globalAlpha *= b; ctx.translate(540, 1700);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-400, -62, 800, 124, 62); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `600 38px ${SANS}`; ctx.letterSpacing = '3px'; ctx.textBaseline = 'middle'; ctx.fillText('VER PREÇOS DE ATACADO', 0, 3);
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= b; ctx.fillStyle = C.mute; ctx.font = `500 30px ${SANS}`; ctx.textAlign = 'center'; ctx.fillText('kaylaatacado.com.br', 540, 1810); ctx.restore();
}

async function scene(t) {
  if (t < B[0]) return hook(t);
  if (t < B[3]) { let k = 0; for (let i = 0; i < 3; i++) if (t >= B[i]) k = i; return product(t, k); }
  if (t < B[4]) return math(t);
  if (t < CARD) return site(t);
  return card(t);
}
async function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
  if (t >= CARD && t < CARD + 0.8) { await site(t); ctx.save(); ctx.globalAlpha = eio((t - CARD) / 0.8); card(t); ctx.restore(); return; }
  await scene(t);
}

window.ready = (async () => {
  const L = [['logo', 'src/logo-kayla.svg'], ['hook', 'src/p-maria2.jpg'], ['card', 'src/p-bruna2.jpg'], ['eve', 'src/p-eve.jpg'], ['eve2', 'src/p-eve2.jpg'],
    ['bruna', 'src/p-bruna.jpg'], ['bruna2', 'src/p-bruna2.jpg'], ['bruna3', 'src/p-bruna3.jpg'], ['maria', 'src/p-maria.jpg'], ['maria3', 'src/p-maria3.jpg']];
  await Promise.all(L.map(([n, s]) => load(n, s)));
  for (const f of [`700 40px Oswald`, `500 40px Oswald`, `400 40px "Playfair Display"`, `500 40px "Playfair Display"`, `italic 400 40px "Playfair Display"`, `500 40px Montserrat`, `600 40px Montserrat`]) await document.fonts.load(f);
  await document.fonts.ready;
  await render(0); return true;
})();
window.renderAt = t => render(t);
