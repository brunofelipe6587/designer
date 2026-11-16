// Home banner, mobile — week 3 (16 a 21/11): progressive discount on the kits, men's and women's mixed. Same identity
// as the approved week-2 banners: black + yellow, BLACK SAND WALK seal, the 3 best sellers side by side on one floor
// line, offer below, CTA well above the bottom (cookie bar). 480×987 proportion drawn at 4× = 1920×3948; layout in
// 960×1974 units.
const K = W / 960, LW = 960, LH = H / K;
function render() {
  ctx.setTransform(K, 0, 0, K, 0, 0); FX = K; W = LW; H = LH;
  bgBlack([[480, 560, 0.20, 700], [480, 1330, 0.14, 650]], false);
  seal(480, 104, 'BLACK SAND WALK', 38, -0.03, YEL, INK, 'center');
  txt('DE ' + OFF.dates.toUpperCase(), 480, 186, '700 26px Inter', '#BDBDBD', 'center');
  // masculino · feminino · masculino: makes it obvious the kits can be mixed
  kitSpot('m_void', 168, 700, 270, { nameSize: 27 });
  kitSpot('m_everflame', 792, 700, 270, { nameSize: 27 });
  kitSpot('blackout', 480, 700, 300, { tag: 'MAIS VENDIDO', nameSize: 27 });
  glowTxt('ATÉ 20% OFF', 480, 990, fit('ATÉ 20% OFF', 700, 170, 'Syne', 880), YEL, 60, 0.55, 'center');
  txt('EM KITS', 480, 1086, '700 84px Syne', WHITE, 'center');
  txt('Quanto mais kits, maior o desconto', 480, 1160, '600 36px Inter', '#E6E6E6', 'center');
  ladder(480, 1440, 280, 18, [178, 206, 238], 1.08);
  txt('Vale para kits masculinos e femininos: pode misturar', 480, 1500, fit('Vale para kits masculinos e femininos: pode misturar', 600, 27, 'Inter', 880), '#BDBDBD', 'center');
  txt('Desconto automático na sacola, sem cupom', 480, 1542, '600 27px Inter', '#BDBDBD', 'center');
  pill('SÓ ATÉ ' + OFF.until, 480, 1612, 30, false, 'center');
  cta('COMPRAR KITS  →', 480, 1730, 700, 112, 42);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
