// V2 · Bicicleta (trap 140 bpm, trap140.wav — bars of 1.714 s, drop at 3.43 s).
// Real bicycle kick from the Sand Walk night shoot: normal speed, then slow motion with a 3-2-1 count on the beats,
// freeze at the contact on the drop and the offer lands on top; plays continue darkened behind sungas + CTA.
const BEAT = 60 / 140, BAR = 4 * BEAT, DROP = 2 * BAR, DUR = 15.6;
const FR = '../../sandwalk-ftvpreta/frames/';
const HIT = 62;     // frame where the foot meets the ball
async function footage(t) {
  let dir = 'b1', n = 85, f, z = 1, filter = 'none';
  if (t < 1.0) f = 1 + t * 29;                                        // real speed
  else if (t < DROP) f = 30 + (HIT - 30) * eio(prog(t, 1.0, DROP)) ;   // slow motion into the contact
  else if (t < DROP + BAR) { f = HIT; z = 1 + 0.08 * eout(prog(t, DROP, DROP + BAR)); }   // freeze
  else if (t < DROP + 2 * BAR) { f = HIT + (85 - HIT) * prog(t, DROP + BAR, DROP + 2 * BAR); z = 1.08; }
  else { const u = (t - DROP - 2 * BAR) / 3.6; dir = u < 1 ? 'b3' : 'b6'; n = u < 1 ? 54 : 84; f = 1 + (u < 1 ? u : Math.min(1, u - 1)) * (n - 1); z = 1.05; }
  if (t >= DROP) filter = `brightness(${t < DROP + 0.25 ? 0.38 + 0.62 * (1 - prog(t, DROP, DROP + 0.25)) : 0.38}) saturate(0.85)`;
  await drawFrame(FR + dir, n, f, { z, ax: 540, ay: 960, filter });
}
async function render(t) {
  W = 1080; H = 1920;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  await footage(t);
  if (t >= DROP) { vfade(0, 500, 0.55, 0); vignette(0.55, 900); }
  else vfade(0, 700, 0.6, 0);
  logo(540, 150, 260, 'center');
  scaled(540, 250, pop(t, 0.05), 1, () => seal(540, 250, 'BLACK SAND WALK', 32, -0.03, YEL, INK, 'center'));
  // 3-2-1 on the beats before the drop
  if (t < DROP) {
    ['3', '2', '1'].forEach((d, i) => {
      const t0 = BAR + (i + 1) * BEAT, t1 = t0 + BEAT;
      if (t >= t0 && t < t1) scaled(540, 480, 0.7 + 0.3 * pop(t, t0, 0.2), 1 - 0.6 * prog(t, t0 + 0.25, t1),
        () => glowTxt(d, 540, 560, '700 260px Syne', YEL, 50, 0.6, 'center'));
    });
    const hk = enter(t, 0.15, 0.35);
    ctx.save(); ctx.globalAlpha = hk * (1 - prog(t, BAR, BAR + 0.2));
    txt('ESPERA O LANCE…', 540, 470, '700 70px Syne', WHITE, 'center'); ctx.restore();
  } else {
    // on the freeze: PARA TUDO, then the offer
    const pt = pop(t, DROP, 0.25), out = prog(t, DROP + 2 * BEAT, DROP + 2 * BEAT + 0.2);
    if (out < 1) scaled(540, 640, pt * (1 + 0.2 * out), 1 - out, () => { ctx.save(); ctx.translate(shake(t, DROP, 18), 0); glowTxt('PARA TUDO', 540, 680, '700 112px Syne', WHITE, 40, 0.3, 'center'); ctx.restore(); });
    if (t >= DROP + 2 * BEAT) offerStack(t, DROP + 2 * BEAT, 430, { size: 175, gap: [0, BEAT, 2 * BEAT, 3 * BEAT] });
    // sungas land one per beat
    const ks = ['blackout', 'graffiti', 'hupi_fire'];
    for (let i = 0; i < 3; i++) {
      const t0 = DROP + BAR + (i + 1) * BEAT;
      if (t < t0) continue;
      const u = enter(t, t0, 0.3), x = 200 + i * 340, y = 860 + 220 * (1 - u);
      ctx.save(); ctx.globalAlpha = u; sunga(ks[i], x, y, 290, (i - 1) * 0.07, { spot: 0.32 }); ctx.restore();
      flash(t, t0, 0.08, 0.25, '255,204,41');
    }
    ctaPulse(t, DROP + 2 * BAR, 1130, 'APROVEITAR OFERTA  →', BEAT * 2);
    ctx.save(); ctx.globalAlpha = enter(t, DROP + 2 * BAR + BEAT, 0.4); footer(1225, 25, '#BDBDBD'); ctx.restore();
    if (t >= 6 * BAR) scaled(540, 1310, pop(t, 6 * BAR), 1, () => pill('SÓ ATÉ 08/11', 540, 1310, 30, true, 'center'));
  }
  flash(t, DROP, 0.2, 0.9);
}
window.ready = (async () => { await loadCommon(); await render(0); return true; })();
window.renderAt = t => render(t);
