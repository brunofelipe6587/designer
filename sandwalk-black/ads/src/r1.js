// R1 · Trio — Reels/Stories 1080×1920. Safe area for the essentials: y 270–1250, x 65–1015 (Reels, the strictest).
// Athletes in the new side-by-side arrangement (no overlap fades), offer + CTA inside the safe area,
// sungas row, validity and ribbon below it (secondary).
function render() {
  bgBlack([[540, 520, 0.12, 760], [540, 1050, 0.16, 700]]);
  const CUT = 835;   // heads start ~235, just inside the safe area
  athleteGroup(1.25, 0, 198, 1, CUT);
  ctx.fillStyle = '#070707'; ctx.fillRect(0, CUT, W, H - CUT);
  const g = ctx.createRadialGradient(540, 1050, 40, 540, 1050, 640); g.addColorStop(0, 'rgba(255,204,41,0.14)'); g.addColorStop(1, 'rgba(255,204,41,0)');
  ctx.fillStyle = g; ctx.fillRect(0, CUT, W, H - CUT); grain();
  ctx.fillStyle = YEL; ctx.fillRect(0, CUT - 2, W, 5);
  logo(540, 70, 260, 'center');
  seal(540, CUT + 4, 'BLACK SAND WALK', 30, -0.03, YEL, INK, 'center');
  txt('3 SUNGAS POR', 540, 950, '700 72px Syne', WHITE, 'center');
  glowTxt('R$ 179', 540, 1088, '700 150px Syne', YEL, 55, 0.55, 'center');
  ctx.font = '600 34px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 28px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 42, x0 = 540 - (dw + 28 + pw) / 2;
  strike('De R$ 209,70', x0, 1146, '600 34px Inter');
  pill('ECONOMIZE R$ 30', x0 + dw + 28, 1134, 28);
  cta('APROVEITAR OFERTA  →', 540, 1209, 620, 74, 32);
  // secondary (below the safe area)
  ['allblack', 'graffiti', 'blackout', 'hupi_fire'].forEach((k, i) => sunga(k, 165 + i * 250, 1400, 215, (i - 1.5) * 0.05, { spot: 0.2 }));
  footer(1560, 24);
  tape(0, 1760, 1080, 1690, YEL, INK, 'BLACK SAND WALK  •  3 SUNGAS POR R$ 179  •  ', 54, 25);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
