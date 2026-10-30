// R3 · Vitrine amarela — Reels/Stories 1080×1920 (essentials inside y 270–1250).
function render() {
  ctx.fillStyle = YEL; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.5; grain(); ctx.restore();
  ctx.save(); ctx.filter = 'invert(1)'; logo(540, 110, 260, 'center'); ctx.restore();
  seal(540, 205, 'BLACK SAND WALK', 30, 0, INK, YEL, 'center');
  txt('LEVE 3 SUNGAS', 540, 365, '700 100px Syne', INK, 'center');
  const pw0 = (() => { ctx.font = '700 58px Syne'; const a = ctx.measureText('POR ').width; ctx.font = '700 138px Syne'; return a + ctx.measureText('R$ 179').width; })();
  const xp = 540 - pw0 / 2; const pw = txt('POR ', xp, 490, '700 58px Syne', INK); txt('R$ 179', xp + pw, 498, '700 138px Syne', INK);
  ctx.font = '700 32px Inter'; const dw = ctx.measureText('De R$ 209,70').width; const bw = 262, x0 = 540 - (dw + 24 + bw) / 2;
  strike('De R$ 209,70', x0, 572, '700 32px Inter', 'rgba(10,10,10,0.6)', 'rgba(10,10,10,0.7)');
  ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(x0 + dw + 24, 535, bw, 50, 25); ctx.fill();
  txt('ECONOMIZE R$ 30', x0 + dw + 24 + bw / 2, 561, '800 25px Inter', YEL, 'center', 'middle');
  const ks = ['blackout', 'hupi_fire', 'graffiti', 'shadow', 'splash', 'allblack', 'pincelada_fluor', 'shadow_laranja', 'grafite_premium'];
  const cw = 300, ch = 172, gap = 14, gx = 540 - (3 * cw + 2 * gap) / 2, gy = 615;
  for (let i = 0; i < 9; i++) {
    const c = i % 3, r = Math.floor(i / 3), x = gx + c * (cw + gap), y = gy + r * (ch + gap);
    ctx.fillStyle = '#0B0B0B'; ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 16); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 16); ctx.clip();
    sunga(ks[i], x + cw / 2, y + ch / 2 + 3, 200, 0, { spot: 0.22, rimA: 0.45 }); ctx.restore();
  }
  ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(540 - 320, 1162, 640, 84, 14); ctx.fill();
  txt('GARANTIR AS MINHAS  →', 540, 1206, '800 33px Inter', YEL, 'center', 'middle');
  txt('Estampas pra todo estilo, do básico ao colorido', 540, 1330, '600 30px Inter', INK, 'center');
  txt('Válido de 02 a 08/11 ou enquanto durar o estoque', 540, 1385, '600 22px Inter', 'rgba(10,10,10,0.75)', 'center');
  tape(0, 1760, 1080, 1690, INK, YEL, 'BLACK SAND WALK  •  3 SUNGAS POR R$ 179  •  ', 54, 25);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
