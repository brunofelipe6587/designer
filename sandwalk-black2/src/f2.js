// F2 · Para tudo — female voice (Thalita) + the "bipolar" track from the client's video (105 bpm). One cut per beat in
// the hook, a "15% OFF" slam on its word, kits changing on the beat while the pieces are named, CTA. Safe area kept.
const L = LNS(VO), DUR = 14.0;
const CUTS = [0, ...cutGrid('bip', 1, 0.05, L.offer.s), ...cutGrid('bip', 2, L.offer.s, DUR)];
const SEQ = [['h1', 0], ['h4', 0], ['h2', 0], ['m4', 0], ['h3', 0], ['m3', 0], ['x1', 0], ['m1', 0], ['m8', 0], ['x3', 0], ['m5', 0], ['m6', 0], ['m10', 0], ['m9', 0], ['x2', 0], ['m7', 0], ['o1', 0]];
const ROT = ['blackout', 'void', 'everflame', 'egypt', 'rhythm', 'vivid', 'brasil', 'megawave', 'phoenix'];
async function render(t) {
  W = 1080; H = 1920;
  const after = t >= L.offer.s - 0.1, d = after ? enter(t, L.offer.s - 0.1, 0.3) : 0;
  await montage(t, CUTS, SEQ, { dim: 0.5 * d, blur: 3 * d, punch: 0.1 });
  vfade(0, 1000, 0.6, 0.1); vfade(980, 1920, 0.1, 0.85);
  scaled(540, 330, pop(t, 0.05), 1, () => seal(540, 330, 'BLACK SAND WALK', 30, -0.03, YEL, INK, 'center'));
  if (t < L.offer.s - 0.1) {
    const w = L.hook.w;   // "Para tudo a Black Sand Walk chegou pra elas"
    scaled(540, 560, pop(t, w[0].s, 0.25), 1, () => { ctx.save(); ctx.translate(shake(t, w[0].s, 14), 0); glowTxt('PARA TUDO', 540, 600, '700 128px Syne', WHITE, 30, 0.3, 'center'); ctx.restore(); });
    scaled(540, 700, pop(t, w[3].s, 0.3), 1, () => txt('A BLACK CHEGOU', 540, 730, '700 76px Syne', WHITE, 'center'));
    scaled(540, 820, pop(t, w[7].s, 0.3), 1, () => glowTxt('PRA ELAS', 540, 850, '700 104px Syne', YEL, 40, 0.5, 'center'));
  } else {
    const ts = L.offer.s - 0.1;
    scaled(540, 470, pop(t, ts, 0.35), 1, () => { ctx.save(); ctx.translate(shake(t, ts, 18), 0); glowTxt(OFF.pct, 540, 530, '700 170px Syne', YEL, 60, 0.6, 'center'); ctx.restore(); });
    scaled(540, 600, pop(t, ts + 0.2, 0.3), 1, () => txt('NOS KITS FEMININOS', 540, 610, '700 50px Syne', WHITE, 'center'));
    if (t >= L.pieces.s - 0.1) {
      const k = Math.floor((t - L.pieces.s) / TRK.bip.beat), key = ROT[((k % ROT.length) + ROT.length) % ROT.length];
      kitCard(key, 540, 820, 400, 320, (0.9 + 0.1 * pop(t, L.pieces.s + k * TRK.bip.beat, 0.2)) * pop(t, L.pieces.s - 0.1, 0.35), { label: true });
      const chips = [['MANGA LONGA', 0], ['MANGA CURTA', 2], ['SHORTS', 5]];
      chips.forEach(([c, wi], i) => { const tw = wordT(L, 'pieces', wi); scaled([215, 540, 865][i], 680, pop(t, tw, 0.3), 1, () => pill(c, [215, 540, 865][i], 680, 22, true, 'center')); });
      priceLine(540, 1035, 0.85, enter(t, wordT(L, 'pieces', 7), 0.3));
    }
  }
  if (t >= L.cta.s - 0.1) { ctx.save(); ctx.globalAlpha = 1; ctaPulse(t, L.cta.s - 0.1, 1100, 'APROVEITAR 15% OFF  →', TRK.bip.beat * 2, 620, 84, 32); ctx.restore(); }
  captions(t, VO, 1212, 900, 40);
  flash(t, L.offer.s - 0.1, 0.2, 0.7, '255,204,41');
}
window.ready = (async () => { await loadCommon(); await render(0); return true; })();
window.renderAt = t => render(t);
