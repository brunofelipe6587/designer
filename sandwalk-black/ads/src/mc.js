// Clean mobile home banner (after testing on the site): 480×987 proportion at 4× = 1920×3948 (the most pixels the
// athlete photos give without upscaling). Kept: the 3 partner athletes, BLACK SAND WALK seal, the offer, the 3
// sungas and the CTA. Removed: SAND WALK logo (the seal already says it), ribbons, side band, long footer, net
// texture, sunga reflections. The offer block sits higher and the CTA ends well above the cookie bar.
// Layout in 960×1974 units.
const K = W / 960, LW = 960, LH = H / K, CUT = 830;
function render() {
  ctx.setTransform(K, 0, 0, K, 0, 0); FX = K; W = LW; H = LH;
  bgBlack([[480, 520, 0.13, 700], [480, 1250, 0.16, 650]], false);
  athleteGroup(1.137, 0, 250, K, CUT, { dx: [0, 35, 0] });
  // lower panel: solid, with a thin yellow line where the athletes end
  ctx.fillStyle = '#070707'; ctx.fillRect(0, CUT, LW, LH - CUT);
  const g = ctx.createRadialGradient(480, 1200, 40, 480, 1200, 640); g.addColorStop(0, 'rgba(255,204,41,0.13)'); g.addColorStop(1, 'rgba(255,204,41,0)');
  ctx.fillStyle = g; ctx.fillRect(0, CUT, LW, LH - CUT);
  ctx.fillStyle = YEL; ctx.fillRect(0, CUT - 2, LW, 5);
  // header
  seal(480, 112, 'BLACK SAND WALK', 38, -0.03, YEL, INK, 'center');
  txt('DE 02 A 08/11', 480, 196, '700 26px Inter', '#BDBDBD', 'center');
  // offer
  txt('3 SUNGAS POR', 480, 950, '700 92px Syne', WHITE, 'center');
  glowTxt('R$ 179', 480, 1160, '700 215px Syne', YEL, 55, 0.5, 'center');
  ctx.font = '600 38px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 31px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 46, x0 = 480 - (dw + 32 + pw) / 2;
  strike('De R$ 209,70', x0, 1262, '600 38px Inter');
  pill('ECONOMIZE R$ 30', x0 + dw + 32, 1249, 31);
  sunga('blackout', 175, 1415, 265, -0.05, { spot: 0.24 });
  sunga('graffiti', 480, 1405, 265, 0, { spot: 0.24 });
  sunga('allblack', 785, 1415, 265, 0.05, { spot: 0.24 });
  cta('APROVEITAR OFERTA  →', 480, 1600, 680, 110, 40);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
