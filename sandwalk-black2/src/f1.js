// F1 · Os 3 mais vendidos — female voice (Thalita) + Outfit Check instrumental (v02, 130 bpm). The ranking comes from
// the sales report (Blackout 102, Void 44, Ever Flame 22). Footage cut every 2 beats in the hook, every bar behind the
// cards; each card lands on its spoken line; offer and CTA close. Essentials inside y 270–1250.
const L = LNS(VO), DUR = 16.6;
const CUTS = [0, ...cutGrid('v02', 2, 0.5, L.n3.s - 0.1), ...cutGrid('v02', 4, L.n3.s, DUR)];
const SEQ = [['h1', 0], ['m1', 0.1], ['h2', 0], ['m7', 0.2], ['h3', 0.1], ['m8', 0], ['m5', 0.1], ['x2', 0], ['m6', 0], ['m2', 0], ['m10', 0], ['x1', 0], ['m9', 0.1]];
const CARDS = [['n3', 'everflame', 3], ['n2', 'void', 2], ['n1', 'blackout', 1]];
async function render(t) {
  W = 1080; H = 1920;
  const prod = t >= L.n3.s - 0.15;
  await montage(t, CUTS, SEQ, { dim: prod ? 0.45 * enter(t, L.n3.s - 0.15, 0.4) : 0, blur: prod ? 3 * enter(t, L.n3.s - 0.15, 0.4) : 0 });
  vfade(0, 1000, 0.72, 0.12); vfade(980, 1920, 0.12, 0.85);
  scaled(540, 330, pop(t, 0.1), 1, () => seal(540, 330, 'BLACK SAND WALK', 30, -0.03, YEL, INK, 'center'));
  if (t < L.n3.s) {
    const ws = L.hook.w;   // "Os três kits femininos mais vendidos da Sand Walk"
    scaled(540, 520, pop(t, ws[0].s, 0.3), 1, () => txt('OS 3 KITS', 540, 560, '700 110px Syne', WHITE, 'center'));
    scaled(540, 650, pop(t, ws[3].s, 0.3), 1, () => txt('FEMININOS', 540, 690, '700 104px Syne', WHITE, 'center'));
    scaled(540, 780, pop(t, ws[4].s, 0.3), 1, () => glowTxt('MAIS VENDIDOS', 540, 815, '700 88px Syne', YEL, 40, 0.5, 'center'));
  }
  // ranking cards, one per spoken line (3º, 2º, 1º)
  if (t >= L.n3.s - 0.15 && t < L.offer.s) {
    CARDS.forEach(([k, kk, n], i) => {
      const t0 = L[k].s - 0.12, next = i < 2 ? L[CARDS[i + 1][0]].s - 0.12 : L.offer.s;
      if (t < t0) return;
      const big = t < next;
      if (big) {
        kitCard(kk, 540, 680, 640, 640, pop(t, t0, 0.4), { hi: n === 1 });
        scaled(250, 400, pop(t, t0 + 0.08, 0.35), 1, () => medal(250, 400, n, 46));
        if (n === 1) scaled(540, 1060, pop(t, t0 + 0.25, 0.3), 1, () => pill('O MAIS VENDIDO', 540, 1060, 32, true, 'center'));
      }
    });
  }
  if (t >= L.offer.s - 0.12) {
    const t0 = L.offer.s - 0.12;
    ['void', 'blackout', 'everflame'].forEach((k, i) => kit(k, [250, 540, 830][i], 620 + (i === 1 ? -10 : 10), i === 1 ? 330 : 280, (i - 1) * 0.06, { spot: 0.25, alpha: enter(t, t0 + i * 0.08, 0.3) }));
    txt('TODOS OS KITS FEMININOS', 540, 420, '700 46px Syne', WHITE, 'center');
    scaled(540, 830, pop(t, wordT(L, 'offer', 7), 0.4), 1, () => glowTxt(OFF.pct, 540, 880, '700 170px Syne', YEL, 60, 0.6, 'center'));
    priceLine(540, 990, 0.9, enter(t, wordT(L, 'offer', 8) + 0.3, 0.3));
  }
  if (t >= L.cta.s - 0.1) {
    ctaPulse(t, L.cta.s - 0.1, 1080, 'GARANTIR O MEU  →', 0.923, 600, 84, 33);
  }
  captions(t, VO, 1212, 900, 40);
}
window.ready = (async () => { await loadCommon(); await render(0); return true; })();
window.renderAt = t => render(t);
