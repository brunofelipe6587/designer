// Shared pieces for the Cardigan Pietro edits (load BEFORE engine.js: it sets the raw-footage FPS / frame count). Brand system from the store CSS:
// Bebas Neue + Inter, #151515 / #FBFBFB, price green #2CA98C, buy-button green #25C793.
// Commercial facts from the product page: R$ 299,90 · R$ 284,90 no PIX · 3x de R$ 99,97 sem juros ·
// jeans, preto, azul marinho · P ao GG · cupom THEFIRST (10% OFF na 1ª compra) · frete grátis a partir de
// R$ 150 para SP, MG, SC, RS e PR (condição informada pelo cliente).
window.FPS_RAW = 23.976; window.N_RAW = 550;
const B = { ink: '#151515', paper: '#FBFBFB', card: '#EDEDED', grey: '#8B8B8B', light: '#BFBFBF', text: '#494E4C',
  price: '#2CA98C', buy: '#25C793', sand: '#ECE5D9', jeans: '#6F95CF', preto: '#2B2B2B', marinho: '#1E2A55' };

// rounded photo, cover-fit, zoom z around focus (fx, fy)
function photo(img, x, y, w, h, o = {}) {
  const { z = 1, fx = 0.5, fy = 0.5, r = 28, a = 1 } = o;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  rrect(x, y, w, h, r); ctx.clip();
  const s = Math.max(w / img.width, h / img.height) * z, dw = img.width * s, dh = img.height * s;
  const dx = clamp(x + w / 2 - fx * dw, x + w - dw, x), dy = clamp(y + h / 2 - fy * dh, y + h - dh, y);
  ctx.drawImage(img, dx, dy, dw, dh); ctx.restore();
}

function swatches(cx, y, a = 1, size = 34) {
  const cols = [['JEANS', B.jeans], ['PRETO', B.preto], ['AZUL MARINHO', B.marinho]];
  ctx.save(); ctx.globalAlpha = a; ctx.font = `700 22px ${F.sans}`; ctx.letterSpacing = '2px'; ctx.textBaseline = 'middle';
  const widths = cols.map(([n]) => size + 12 + ctx.measureText(n).width), gap = 36, total = widths.reduce((s, v) => s + v, 0) + gap * 2;
  let x = cx - total / 2;
  cols.forEach(([n, c], i) => {
    ctx.beginPath(); ctx.arc(x + size / 2, y, size / 2, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = B.ink; ctx.textAlign = 'left'; ctx.fillText(n, x + size + 12, y + 1); x += widths[i] + gap;
  });
  ctx.restore();
}

// end card mirroring the store's product card: photo, name, PIX price, instalments, colours, CTA, conditions
function endCard(t, t0, img, o = {}) {
  const { dark = true } = o;
  const p = prog(t, t0, t0 + 0.4);
  ctx.save(); ctx.globalAlpha = eout(p);
  ctx.fillStyle = dark ? 'rgba(12,12,12,.55)' : B.paper; ctx.fillRect(0, 0, W, H); ctx.restore();
  const y0 = 230 + (1 - eout(p)) * 80;
  ctx.save(); ctx.globalAlpha = eout(p); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 10;
  rrect(60, y0, W - 120, 1360, 36); ctx.fillStyle = B.paper; ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = eout(p);
  rrect(100, y0 + 40, W - 200, 600, 24); ctx.fillStyle = B.card; ctx.fill(); ctx.clip();
  const h = 1150, w = h * img.width / img.height; ctx.drawImage(img, W / 2 - w / 2, y0 + 60, w, h);   // head to hips
  ctx.restore();
  ctx.save(); ctx.globalAlpha = eout(p); ctx.fillStyle = B.ink; rrect(130, y0 + 70, 230, 48, 24); ctx.fill();
  ctx.font = `700 20px ${F.sans}`; ctx.letterSpacing = '3px'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Nº 1 EM VENDAS', 245, y0 + 95); ctx.restore();
  txt('CARDIGAN PIETRO', W / 2, y0 + 730, { size: 92, color: B.ink, align: 'center', p: prog(t, t0 + 0.15, t0 + 0.5), shadow: 0 });
  const pp = prog(t, t0 + 0.25, t0 + 0.6);
  ctx.save(); ctx.font = `400 120px ${F.display}`; const pw = ctx.measureText('R$ 284,90').width; ctx.font = `700 30px ${F.sans}`; const sw = ctx.measureText(' NO PIX').width; ctx.restore();
  const px = W / 2 - (pw + sw + 12) / 2;
  txt('R$ 284,90', px, y0 + 860, { size: 120, color: B.price, p: pp, shadow: 0 });
  txt('NO PIX', px + pw + 12, y0 + 850, { font: F.sans, weight: 700, size: 30, ls: 3, color: B.price, p: pp, shadow: 0 });
  txt('ou R$ 299,90 em 3x de R$ 99,97 sem juros', W / 2, y0 + 915, { font: F.sans, weight: 500, size: 30, color: B.text, align: 'center', p: prog(t, t0 + 0.35, t0 + 0.7), shadow: 0 });
  swatches(W / 2, y0 + 985, clamp(prog(t, t0 + 0.45, t0 + 0.8) * 2));
  txt('P · M · G · GG', W / 2, y0 + 1055, { font: F.sans, weight: 700, size: 24, ls: 4, color: B.grey, align: 'center', p: prog(t, t0 + 0.5, t0 + 0.85), shadow: 0 });
  button('COMPRAR AGORA', W / 2, y0 + 1100, t, { bg: B.buy, w: W - 240, h: 112, size: 34, weight: 700, p: prog(t, t0 + 0.6, t0 + 1.0) });
  txt('10% OFF na 1ª compra · cupom THEFIRST', W / 2, y0 + 1275, { font: F.sans, weight: 600, size: 26, color: B.ink, align: 'center', p: prog(t, t0 + 0.8, t0 + 1.1), shadow: 0 });
  txt('Frete grátis a partir de R$ 150 · SP, MG, SC, RS e PR', W / 2, y0 + 1318, { font: F.sans, weight: 500, size: 24, color: B.text, align: 'center', p: prog(t, t0 + 0.9, t0 + 1.2), shadow: 0 });
}
