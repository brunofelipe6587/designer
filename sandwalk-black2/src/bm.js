// Home banner, mobile — week 2 (kits femininos 15% OFF), clean style approved for the week-1 banner: seal + dates on
// top, the 3 best-selling kits as the hero, offer, CTA well above the bottom (cookie bar). 480×987 proportion drawn
// at 4× = 1920×3948; layout in 960×1974 units.
const K = W / 960, LW = 960, LH = H / K;
function render() {
  ctx.setTransform(K, 0, 0, K, 0, 0); FX = K; W = LW; H = LH;
  bgBlack([[480, 640, 0.20, 700], [480, 1380, 0.14, 650]], false);
  seal(480, 120, 'BLACK SAND WALK', 38, -0.03, YEL, INK, 'center');
  txt('DE 09 A 15/11', 480, 204, '700 26px Inter', '#BDBDBD', 'center');
  // the 3 best sellers, side by side, aligned, each on its own soft light (Blackout in the middle, a little taller)
  roseHaze(480, 640, 560);
  kitSpot('void', 172, 840, 285, { nameSize: 28 });
  kitSpot('everflame', 788, 840, 285, { nameSize: 28 });
  kitSpot('blackout', 480, 840, 330, { tag: 'MAIS VENDIDO', nameSize: 28 });
  txt('KITS FEMININOS', 480, 1110, '700 84px Syne', WHITE, 'center');
  glowTxt(OFF.pct, 480, 1320, '700 186px Syne', YEL, 60, 0.55, 'center');
  ctx.font = '600 40px Inter'; const a = 'de ' + OFF.from, aw = ctx.measureText(a).width; ctx.font = '700 76px Syne'; const b = 'por ' + OFF.to, bw = ctx.measureText(b).width;
  const x0 = 480 - (aw + 26 + bw) / 2;
  strike(a, x0, 1450, '600 40px Inter'); glowTxt(b, x0 + aw + 26, 1452, '700 76px Syne', YEL, 30, 0.45);
  txt('Manga longa + manga curta + shorts', 480, 1520, '600 34px Inter', '#CFCFCF', 'center');
  cta('APROVEITAR 15% OFF  →', 480, 1650, 700, 112, 40);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
