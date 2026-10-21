// Creative 3 — "A conta da lojista": wholesale prices of three best sellers, then the 6-piece minimum order added up.
// Version A (window.VERSION = 'a') sets each price beside the brand's own retail price (kaylastore.com.br, full price);
// version B shows wholesale prices only. Prices as of 21/10/2026. No voice; the brand's reel music, as in creative 2.
// Evergreen: no season, no collection or product names (garment type only). Text inside the safe zone (common.js).
const V = window.VERSION || 'a';
const DUR = 27.4;
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

function hook(t) {
  cover(IMG.hook, 0, 0, W, H, 0.5, 0.15, 1.04 + 0.04 * prog(t, 0, B[0]));
  hookText(t, 'quanto custa começar?', 'Faça a conta com a gente');
}
function product(t, k) {
  const p = PRODUCTS[k], at = B[k], l = t - at;
  studio();
  fadePhoto(IMG[p.img], 1000, p.fy, 1.03 + 0.04 * prog(t, at, at + 3.4), 620);
  const a = eout(prog(l, 0.1, 0.5));
  ctx.save(); ctx.globalAlpha *= a; label(`${p.type} · GRADE 42 AO 54`, 540, 990, C.mute, 26); ctx.restore();
  ctx.save(); ctx.textAlign = 'center';
  if (V === 'a') {
    // two columns: wholesale (big, ink) → the brand's retail price (lighter)
    const a1 = eout(prog(l, 0.35, 0.75)), a2 = eout(prog(l, 1.15, 1.55)), a3 = eout(prog(l, 1.85, 2.25));
    ctx.save(); ctx.globalAlpha *= a1; ctx.translate(0, (1 - a1) * 22);
    label('NO ATACADO', 275, 1060, C.mute, 24); ctx.fillStyle = C.ink; ctx.font = `700 104px ${COND}`; ctx.fillText(brl(p.w), 275, 1170);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= a2; ctx.translate((1 - a2) * 36, 0);
    ctx.fillStyle = C.mute; ctx.font = `400 60px ${SERIF}`; ctx.fillText('→', 548, 1146);
    label('NA LOJA KAYLA', 815, 1060, C.mute, 24); ctx.font = `500 86px ${COND}`; ctx.fillStyle = C.mute; ctx.fillText(brl(p.r), 815, 1164);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= a3; ctx.fillStyle = C.ink; ctx.font = `italic 400 44px ${SERIF}`; ctx.fillText('a mesma peça no varejo da marca', 540, 1236); ctx.restore();
  } else {
    const a1 = eout(prog(l, 0.35, 0.75)), a2 = eout(prog(l, 1.3, 1.7));
    ctx.save(); ctx.globalAlpha *= a1; ctx.translate(0, (1 - a1) * 22);
    label('NO ATACADO', 540, 1060, C.mute, 26); ctx.fillStyle = C.ink; ctx.font = `700 118px ${COND}`; ctx.fillText(brl(p.w), 540, 1168);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= a2; ctx.fillStyle = C.ink; ctx.font = `italic 400 46px ${SERIF}`; ctx.fillText(`${brl(p.pix)} no PIX`, 540, 1240); ctx.restore();
  }
  ctx.restore();
}
function math(t) {
  const l = t - B[3];
  studio();
  const a = eout(prog(l, 0, 0.4));
  ctx.save(); ctx.globalAlpha *= a; ctx.textAlign = 'center';
  ctx.fillStyle = C.ink; ctx.font = `400 56px ${SERIF}`; ctx.fillText('Seu pedido mínimo:', 540, 340);
  ctx.font = `700 96px ${COND}`; ctx.letterSpacing = '3px'; ctx.fillText('6 PEÇAS', 543, 440);
  ctx.restore();
  // the six pieces pop in as a 3×2 grid, then slide up into a strip to make room for the totals
  const m = eio(prog(l, 2.7, 3.2));
  GRID.forEach(([n, price], i) => {
    const p = eback(prog(l, 0.5 + i * 0.3, 0.9 + i * 0.3)); if (p <= 0) return;
    const gw = 220, gh = 270, gx = 180 + (i % 3) * 250, gy = 480 + Math.floor(i / 3) * 365;
    const sw = 140, sh = 172, sx = 80 + i * 156, sy = 482;
    const tw = lerp(gw, sw, m), th = lerp(gh, sh, m), x = lerp(gx, sx, m), y = lerp(gy, sy, m);
    ctx.save(); ctx.translate(x + tw / 2, y + th / 2); ctx.scale(p, p);
    ctx.shadowColor = 'rgba(40,25,15,0.25)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-tw / 2 - 7, -th / 2 - 7, tw + 14, th + 14, 16); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.roundRect(-tw / 2, -th / 2, tw, th, 11); ctx.clip();
    cover(IMG[n], -tw / 2, -th / 2, tw, th, 0.5, 0.15);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= clamp(p); ctx.fillStyle = C.ink; ctx.font = `600 ${lerp(28, 24, m)}px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText(brl(price), x + tw / 2, y + th + lerp(40, 34, m)); ctx.restore();
  });
  // totals, counting up
  const c1 = prog(l, 3.2, 4.1), c2 = prog(l, 4.5, 5.4);
  ctx.save(); ctx.textAlign = 'center';
  if (c1 > 0) {
    ctx.save(); ctx.globalAlpha *= eout(prog(l, 3.2, 3.55));
    label('VOCÊ INVESTE', 540, 770, C.mute, 28);
    ctx.fillStyle = C.ink; ctx.font = `700 124px ${COND}`; ctx.fillText(brl(TOTAL_W * eout(c1)), 540, 895);
    ctx.restore();
  }
  if (c2 > 0) {
    ctx.save(); ctx.globalAlpha *= eout(prog(l, 4.5, 4.85));
    if (V === 'a') {
      ctx.fillStyle = C.ink; ctx.font = `italic 400 46px ${SERIF}`; ctx.fillText('na loja Kayla, essas 6 peças somam', 540, 985);
      ctx.fillStyle = C.green; ctx.font = `700 108px ${COND}`; ctx.fillText(brl(TOTAL_R * eout(c2)), 540, 1100);
    } else {
      ctx.fillStyle = C.ink; ctx.font = `italic 400 52px ${SERIF}`; ctx.fillText(`ou ${brl(TOTAL_PIX)} no PIX`, 540, 990);
      label('CORES E TAMANHOS VARIADOS', 540, 1070, C.mute, 26);
    }
    ctx.restore();
  }
  ctx.restore();
}
async function site(t) {
  const l = t - B[4];
  studio();
  phoneWindow(await tela(69.8 + l * 0.12), 0.36, null, eout(prog(l, 0, 0.6)));
  stepCaption('TODOS OS PREÇOS NO SITE', 'Cadastre seu CNPJ', l);
}

async function scene(t) {
  if (t < B[0]) return hook(t);
  if (t < B[3]) { let k = 0; for (let i = 0; i < 3; i++) if (t >= B[i]) k = i; return product(t, k); }
  if (t < B[4]) return math(t);
  if (t < CARD) return site(t);
  return endCard(t, CARD, DUR - CARD, IMG.card, 0.1);
}
async function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
  if (t >= CARD && t < CARD + 0.8) { await site(t); ctx.save(); ctx.globalAlpha = eio((t - CARD) / 0.8); endCard(t, CARD, DUR - CARD, IMG.card, 0.1); ctx.restore(); }
  else await scene(t);
  safeGuides();
}

window.ready = (async () => {
  const L = [['logo', 'src/logo-kayla.svg'], ['hook', 'src/p-maria2.jpg'], ['card', 'src/p-bruna2.jpg'], ['eve', 'src/p-eve.jpg'], ['eve2', 'src/p-eve2.jpg'],
    ['bruna', 'src/p-bruna.jpg'], ['bruna2', 'src/p-bruna2.jpg'], ['bruna3', 'src/p-bruna3.jpg'], ['maria', 'src/p-maria.jpg'], ['maria3', 'src/p-maria3.jpg']];
  await Promise.all(L.map(([n, s]) => load(n, s)));
  await loadFonts();
  await render(0); return true;
})();
window.renderAt = t => render(t);
