// R6 · Preço por sunga — Reels/Stories 1080×1920 (essentials inside y 270–1250).
function card(x, y, w, h, hi) {
  ctx.save();
  if (hi) { ctx.shadowColor = 'rgba(255,204,41,0.45)'; ctx.shadowBlur = 40; }
  ctx.fillStyle = hi ? '#161204' : '#111'; ctx.strokeStyle = hi ? YEL : '#2A2A2A'; ctx.lineWidth = hi ? 4 : 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.fill(); ctx.stroke(); ctx.restore();
}
function render() {
  bgBlack([[760, 760, 0.14, 650]]);
  logo(540, 90, 260, 'center');
  seal(540, 190, 'BLACK SAND WALK', 30, -0.03, YEL, INK, 'center');
  txt('MENOS DE R$ 60', 540, 365, '700 84px Syne', WHITE, 'center');
  txt('POR SUNGA', 540, 452, '700 84px Syne', YEL, 'center');
  card(70, 525, 410, 470, false);
  txt('AVULSA', 275, 580, '700 28px Inter', GREY, 'center');
  sunga('allblack', 275, 715, 270, 0, { spot: 0.18, alpha: 0.75 });
  txt('1 sunga', 275, 880, '600 30px Inter', GREY, 'center');
  txt('R$ 69,90', 275, 950, '700 60px Syne', '#BDBDBD', 'center');
  card(510, 505, 500, 510, true);
  ctx.fillStyle = YEL; ctx.beginPath(); ctx.roundRect(640, 483, 240, 44, 22); ctx.fill();
  txt('NA BLACK', 760, 506, '800 23px Inter', INK, 'center', 'middle');
  sunga('graffiti', 640, 650, 200, -0.12, { spot: 0.15 });
  sunga('hupi_fire', 880, 650, 200, 0.12, { spot: 0.15 });
  sunga('blackout', 760, 622, 220, 0, { spot: 0.25 });
  txt('3 sungas por', 760, 790, '600 32px Inter', WHITE, 'center');
  glowTxt('R$ 179', 760, 890, '700 104px Syne', YEL, 40, 0.6, 'center');
  txt('= R$ 59,67 cada', 760, 965, '800 34px Inter', WHITE, 'center');
  ctx.font = '600 32px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 28px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 42, x0 = 540 - (dw + 28 + pw) / 2;
  strike('De R$ 209,70', x0, 1085, '600 32px Inter');
  pill('ECONOMIZE R$ 30', x0 + dw + 28, 1074, 28);
  cta('APROVEITAR OFERTA  →', 540, 1192, 640, 88, 35);
  footer(1330, 24);
  tape(0, 1760, 1080, 1690, YEL, INK, 'BLACK SAND WALK  •  3 SUNGAS POR R$ 179  •  ', 54, 25);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
