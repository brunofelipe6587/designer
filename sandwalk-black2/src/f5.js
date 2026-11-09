// F5 · Qual estampa é a sua? — music only (Outfit Check instrumental); the narration script only sets the timing,
// snapped to the beat. One kit per spoken name, then the
// grid of nine prints with 15% OFF, CTA.
const SVO = snapVO(VO, 'v02'), L = LNS(SVO), DUR = 13.4;
const CUTS = [0, ...cutGrid('v02', 2, 0.5, DUR)];
const SEQ = [['h3', 0], ['m10', 0], ['m5', 0], ['h1', 0], ['x4', 0], ['m6', 0], ['m2', 0], ['x2', 0], ['m8', 0], ['m9', 0], ['o1', 0], ['m1', 0], ['h2', 0], ['m7', 0]];
const LIST = ['blackout', 'void', 'everflame', 'egypt', 'rhythm', 'vivid'];
async function render(t) {
  W = 1080; H = 1920;
  const d = enter(t, L.list.s - 0.1, 0.35);
  await montage(t, CUTS, SEQ, { dim: 0.1 + 0.45 * d, blur: 3 * d });
  vfade(0, 900, 0.65, 0.1); vfade(980, 1920, 0.1, 0.88);
  scaled(540, 330, pop(t, 0.05), 1, () => seal(540, 330, 'BLACK SAND WALK', 30, -0.03, YEL, INK, 'center'));
  if (t < L.list.s - 0.1) {
    const w = L.hook.w;   // "Qual estampa é a sua cara"
    scaled(540, 560, pop(t, w[0].s, 0.3), 1, () => txt('QUAL ESTAMPA', 540, 600, '700 100px Syne', WHITE, 'center'));
    scaled(540, 700, pop(t, w[2].s, 0.3), 1, () => glowTxt('É A SUA CARA?', 540, 730, '700 96px Syne', YEL, 40, 0.5, 'center'));
    scaled(540, 800, pop(t, w[3].s, 0.3), 1, () => txt('KITS FEMININOS SAND WALK', 540, 820, '700 40px Syne', WHITE, 'center'));
  } else if (t < L.offer.s - 0.1) {
    const ws = L.list.w; let i = 0; while (i + 1 < ws.length && t >= ws[i + 1].s - 0.06) i++;
    const key = LIST[Math.min(i, LIST.length - 1)];
    kitCard(key, 540, 720, 640, 640, 0.92 + 0.08 * pop(t, ws[i].s - 0.06, 0.22), { hi: i === 0 });
    txt(`${Math.min(i, 5) + 1}/10`, 540, 1090, '700 28px Inter', '#BDBDBD', 'center');
  } else {
    const t0 = L.offer.s - 0.1, ks = KITS.slice(0, 9), cw = 300, ch = 172, gap = 12, gx = 540 - (3 * cw + 2 * gap) / 2, gy = 510;
    scaled(540, 410, pop(t, t0, 0.35), 1, () => { glowTxt(OFF.pct, 540, 435, '700 84px Syne', YEL, 40, 0.55, 'center'); txt('EM TODOS OS KITS FEMININOS', 540, 485, '700 34px Syne', WHITE, 'center'); });
    ks.forEach((k, i) => {
      const c = i % 3, r = Math.floor(i / 3), x = gx + c * (cw + gap), y = gy + r * (ch + gap);
      kitCard(k, x + cw / 2, y + ch / 2, cw, ch, pop(t, t0 + 0.08 + i * 0.05, 0.3), { label: false });
    });
    priceLine(540, 1110, 0.85, enter(t, t0 + 0.6, 0.3));
    if (t >= L.cta.s - 0.1) ctaPulse(t, L.cta.s - 0.1, 1190, 'ESCOLHER O MEU  →', TRK.v02.beat * 2, 560, 72, 30);
    else { ctx.save(); ctx.globalAlpha = enter(t, t0 + 0.8, 0.3); txt('Só até domingo, 15/11', 540, 1190, '700 30px Inter', WHITE, 'center'); ctx.restore(); }
  }
}
window.ready = (async () => { await loadCommon(); await render(0); return true; })();
window.renderAt = t => render(t);
