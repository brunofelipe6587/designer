// V6 · A matemática da Black (lofi_ftv2.wav — 85 bpm, beats of 0.706 s; first 17 s with a fade).
// A calm sum written line by line: 1 sunga R$ 69,90 → × 3 = R$ 209,70 → desconto Black − R$ 30 → total R$ 179
// → ÷ 3 = R$ 59,67 por sunga (circled) → CTA.
const BEAT = 60 / 85, BAR = 4 * BEAT, DUR = 17;
const L = 110, R = 970;
function typed(s, x, y, font, color, align, t, t0, d = 0.35) {
  const n = Math.round(s.length * prog(t, t0, t0 + d)); if (n <= 0) return;
  txt(s.slice(0, n), x, y, font, color, align);
}
function row(t, t0, y, label, value, vfont = '700 64px Syne', vcol = WHITE, lx = L) {
  if (t < t0) return;
  ctx.save(); ctx.globalAlpha = enter(t, t0, 0.3);
  typed(label, lx, y, '600 40px Inter', '#D0D0D0', 'left', t, t0, 0.3);
  const u = enter(t, t0 + 0.25, 0.35);
  ctx.globalAlpha *= u; txt(value, R + 40 * (1 - u), y, vfont, vcol, 'right'); ctx.restore();
}
function render(t) {
  W = 1080; H = 1920;
  ctx.fillStyle = '#060606'; ctx.fillRect(0, 0, W, H);
  // squared paper in faint yellow
  ctx.save(); ctx.strokeStyle = 'rgba(255,204,41,0.06)'; ctx.lineWidth = 2;
  for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore(); grain();
  const g = ctx.createRadialGradient(540, 860, 50, 540, 860, 800); g.addColorStop(0, 'rgba(255,204,41,0.10)'); g.addColorStop(1, 'rgba(255,204,41,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  logo(540, 150, 260, 'center');
  scaled(540, 250, pop(t, 0.05), 1, () => seal(540, 250, 'BLACK SAND WALK', 30, -0.03, YEL, INK, 'center'));
  typed('A MATEMÁTICA', 540, 350, '700 76px Syne', WHITE, 'center', t, 0.2, 0.4);
  typed('DA BLACK', 540, 432, '700 76px Syne', YEL, 'center', t, 0.6, 0.3);
  // sunga icon next to the first line
  if (t > 2 * BEAT) scaled(L + 60, 515, pop(t, 2 * BEAT, 0.35), 1, () => sunga('graffiti', L + 58, 525, 112, -0.06, { spot: 0.18, rimA: 0.4 }));
  row(t, 2 * BEAT, 543, '1 sunga', 'R$ 69,90', '700 64px Syne', WHITE, L + 140);
  row(t, 4 * BEAT, 640, '× 3 sungas', 'R$ 209,70');
  row(t, 6 * BEAT, 737, 'desconto Black', '− R$ 30', '700 64px Syne', YEL);
  if (t > 8 * BEAT) { const u = enter(t, 8 * BEAT, 0.4); ctx.fillStyle = WHITE; ctx.fillRect(L, 774, (R - L) * u, 4); }
  if (t > 8 * BEAT + 0.3) {
    ctx.save(); ctx.globalAlpha = enter(t, 8 * BEAT + 0.3, 0.3); txt('TOTAL', L, 895, '800 46px Inter', WHITE); ctx.restore();
    const sh = shake(t, 9 * BEAT, 10);
    scaled(R - 200, 855, pop(t, 9 * BEAT, 0.4), 1, () => glowTxt('R$ 179', R + sh, 920, '700 150px Syne', YEL, 50, 0.6, 'right'));
  }
  row(t, 12 * BEAT, 1025, '÷ 3', 'R$ 59,67 cada', '700 60px Syne', WHITE);
  // hand-drawn circle around the per-sunga price
  if (t > 13 * BEAT) {
    const u = eout(prog(t, 13 * BEAT, 13 * BEAT + 0.6));
    ctx.save(); ctx.strokeStyle = YEL; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
    for (let k = 0; k <= 80 * u; k++) {
      const a = -2.6 + k / 80 * Math.PI * 2.15, rx = 260 + 8 * Math.sin(k * 0.3), ry = 70;
      const x = 755 + rx * Math.cos(a), y = 1005 + ry * Math.sin(a) + k * 0.15;
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = enter(t, 14 * BEAT, 0.4); txt('menos de R$ 60 por sunga', 540, 1118, '700 40px Inter', YEL, 'center'); ctx.restore();
  }
  if (t > 16 * BEAT) {
    ctaPulse(t, 16 * BEAT, 1200, 'APROVEITAR OFERTA  →', 2 * BEAT, 620, 84, 33);
    ctx.save(); ctx.globalAlpha = enter(t, 17 * BEAT, 0.4); footer(1300, 24); ctx.restore();
  }
  // a row of sungas along the bottom (decor)
  if (t > 18 * BEAT) {
    const ks = ['blackout', 'hupi_fire', 'allblack', 'splash'];
    ks.forEach((k, i) => scaled(165 + i * 250, 1560, pop(t, 18 * BEAT + i * 0.15, 0.35), 1, () => sunga(k, 165 + i * 250, 1560, 210, (i - 1.5) * 0.05, { spot: 0.2 })));
  }
  if (t > DUR - 0.6) { ctx.fillStyle = `rgba(0,0,0,${prog(t, DUR - 0.6, DUR)})`; ctx.fillRect(0, 0, W, H); }
}
window.ready = (async () => { await loadCommon(); render(0); return true; })();
window.renderAt = t => render(t);
