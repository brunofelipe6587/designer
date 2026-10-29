// E4 · Atleta: the smiling partner athlete (SW shirt) big on the right, bold stacked offer on the left.
function render() {
  bgBlack([[760, 420, 0.14, 700], [250, 900, 0.10, 500]]);
  athlete('a3', 300, 110, 0.70, { crop: [200, 0, 1100, 1900], fade: [0.55, 0.80] });
  vfade(900, 1180, 0, 1); ctx.fillStyle = '#050505'; ctx.fillRect(0, 1180, W, H - 1180);
  // left column (left of his body)
  logo(60, 60, 260);
  seal(60, 170, 'BLACK SAND WALK', 26, -0.04);
  txt('3', 52, 420, '700 250px Syne', WHITE);
  txt('SUNGAS', 60, 560, '700 74px Syne', WHITE);
  txt('POR', 64, 632, '700 46px Syne', WHITE);
  glowTxt('R$ 179', 56, 760, '700 128px Syne', YEL, 50, 0.6);
  strike('De R$ 209,70', 62, 840, '600 32px Inter');
  pill('ECONOMIZE R$ 30', 60, 898, 26, true);
  // sungas strip + CTA
  const ks = ['allblack', 'graffiti', 'blackout'];
  for (let i = 0; i < 3; i++) sunga(ks[i], 200 + i * 340, 1035, 250, (i - 1) * 0.05, { spot: 0.28 });
  cta('APROVEITAR OFERTA  →', 540, 1218, 640, 90, 35);
  footer(1300, 23);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
