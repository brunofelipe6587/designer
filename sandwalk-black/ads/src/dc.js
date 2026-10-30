// Clean desktop home banner 1920×960 (same cleanup as the mobile one): the 3 partner athletes side by side on the
// left (same arrangement), BLACK SAND WALK seal + dates, offer, 3 sungas and CTA in a centred column on the right,
// CTA kept clear of the bottom (cookie bar). No logo, ribbons, footer or net texture.
const CUT = 763, COL = 1560;
function render() {
  bgBlack([[560, 420, 0.12, 700], [COL, 430, 0.16, 650]], false);
  athleteGroup(1.3, 0, 100, 1, CUT);
  ctx.fillStyle = '#070707'; ctx.fillRect(0, CUT, W, H - CUT);
  ctx.fillStyle = YEL; ctx.fillRect(0, CUT - 2, 1100, 5);
  // offer column
  seal(COL, 112, 'BLACK SAND WALK', 34, -0.03, YEL, INK, 'center');
  txt('DE 02 A 08/11', COL, 186, '700 24px Inter', '#BDBDBD', 'center');
  txt('3 SUNGAS POR', COL, 290, '700 70px Syne', WHITE, 'center');
  glowTxt('R$ 179', COL, 455, '700 168px Syne', YEL, 50, 0.5, 'center');
  ctx.font = '600 32px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 27px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 40, x0 = COL - (dw + 28 + pw) / 2;
  strike('De R$ 209,70', x0, 532, '600 32px Inter');
  pill('ECONOMIZE R$ 30', x0 + dw + 28, 521, 27);
  sunga('blackout', COL - 225, 650, 205, -0.05, { spot: 0.24 });
  sunga('graffiti', COL, 642, 205, 0, { spot: 0.24 });
  sunga('allblack', COL + 225, 650, 205, 0.05, { spot: 0.24 });
  cta('APROVEITAR OFERTA  →', COL, 790, 580, 96, 34);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
