// R2 · A conta — Reels/Stories 1080×1920 (essentials inside y 270–1250).
function render() {
  bgBlack([[540, 560, 0.10, 650], [540, 900, 0.20, 600]]);
  logo(540, 90, 260, 'center');
  seal(540, 190, 'BLACK SAND WALK', 32, -0.03, YEL, INK, 'center');
  txt('A CONTA MAIS', 540, 360, '700 66px Syne', WHITE, 'center');
  txt('FÁCIL DA BLACK', 540, 432, '700 66px Syne', WHITE, 'center');
  const xs = [190, 540, 890], ks = ['graffiti', 'blackout', 'hupi_fire'], rot = [-0.07, 0, 0.07];
  for (let i = 0; i < 3; i++) sunga(ks[i], xs[i], 595, 250, rot[i], { spot: 0.32 });
  for (const x of [365, 715]) txt('+', x, 622, '700 84px Syne', YEL, 'center');
  txt('=', 540, 790, '700 104px Syne', YEL, 'center');
  glowTxt('R$ 179', 540, 975, '700 196px Syne', YEL, 70, 0.6, 'center');
  ctx.font = '600 36px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 30px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 45, x0 = 540 - (dw + 30 + pw) / 2;
  strike('De R$ 209,70', x0, 1080, '600 36px Inter');
  pill('ECONOMIZE R$ 30', x0 + dw + 30, 1067, 30);
  cta('APROVEITAR OFERTA  →', 540, 1192, 640, 88, 35);
  footer(1330, 24);
  tape(0, 1760, 1080, 1690, YEL, INK, 'BLACK SAND WALK  •  3 SUNGAS POR R$ 179  •  ', 54, 25);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
