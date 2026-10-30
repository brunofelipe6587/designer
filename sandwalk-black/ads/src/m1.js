// Mobile home banner (proportion of the site's mobile banner, 480×987 → drawn at 2×: 960×1974; also fits 960×1940).
// Same elements as the approved desktop 1920×960: 3 partner athletes on top (original pixels, ball recoloured),
// ribbons, seal, 3 SUNGAS POR R$ 179, De R$ 209,70 + economize R$ 30, the 3 sungas with studio light, CTA, validity.
// The offer block is anchored to the bottom so the same layout works for any height near 2:1.
function render() {
  const B = H - 1974;   // bottom offset (0 at 1974 tall)
  bgBlack([[480, 520, 0.10, 700], [480, 1350 + B, 0.20, 650]]);
  athlete('a3', -105, 245, 0.44);
  athlete('a1', 545, 222, 0.57);
  athlete('a2', 128, 236, 0.47, { rot: 0.21 });   // turned ~12° clockwise so he stands straighter
  vfade(700, 980, 0, 1); ctx.fillStyle = '#050505'; ctx.fillRect(0, 980, W, H - 980);
  // ribbons across the athletes' base
  tape(0, 1045, 960, 925, '#141414', 'rgba(255,204,41,0.65)', 'BLACK SAND WALK  •  ', 56, 27);
  tape(0, 985, 960, 905, YEL, INK, 'BLACK SAND WALK  •  3 SUNGAS POR R$ 179  •  ', 60, 28, 40);
  logo(480, 52, 300, 'center');
  seal(480, 145, 'BLACK SAND WALK', 34, -0.03, YEL, INK, 'center');
  // offer
  txt('3 SUNGAS POR', 480, 1175 + B, '700 92px Syne', WHITE, 'center');
  glowTxt('R$ 179', 480, 1375 + B, '700 200px Syne', YEL, 60, 0.55, 'center');
  ctx.font = '600 36px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 30px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 45, x0 = 480 - (dw + 30 + pw) / 2;
  strike('De R$ 209,70', x0, 1467 + B, '600 36px Inter');
  pill('ECONOMIZE R$ 30', x0 + dw + 30, 1454 + B, 30);
  sunga('blackout', 175, 1610 + B, 250, -0.06, { reflect: true });
  sunga('graffiti', 480, 1600 + B, 250, 0, { reflect: true });
  sunga('allblack', 785, 1610 + B, 250, 0.06, { reflect: true });
  cta('APROVEITAR OFERTA  →', 480, 1800 + B, 640, 104, 38);
  footer(1912 + B, 25);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
