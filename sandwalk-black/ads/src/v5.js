// V5 · Só 7 dias (tick120.wav — 120 bpm, a clock tick on every beat, drop at 4.0 s, offer bars from 12 s).
// The 7 days of the campaign (02–08/11) land one per tick; on the drop the calendar moves up, a big sunga changes
// print on every beat and the offer + CTA come in.
const BEAT = 0.5, BAR = 2, DROP = 4, DUR = 16;
const ROT = ['blackout', 'hupi_fire', 'graffiti', 'shadow', 'splash', 'allblack', 'stars', 'pincelada_fluor', 'shadow_laranja', 'tricolor', 'grafite_premium'];
const DAYS = ['02', '03', '04', '05', '06', '07', '08'], WD = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
function calendar(t, cy, s) {
  const bw = 128, gap = 12, x0 = 540 - (7 * bw + 6 * gap) / 2;
  ctx.save(); ctx.translate(540, cy); ctx.scale(s, s); ctx.translate(-540, -cy);
  for (let i = 0; i < 7; i++) {
    const t0 = BEAT * (i + 1), p = pop(t, t0, 0.25); if (p <= 0) continue;
    const x = x0 + i * (bw + gap), last = i === 6, beatGlow = last && t > DROP ? 0.5 + 0.5 * Math.cos(((t - DROP) % BEAT) / BEAT * Math.PI * 2) : 0;
    scaled(x + bw / 2, cy, p, 1, () => {
      ctx.save(); if (last) { ctx.shadowColor = `rgba(255,204,41,${0.4 + 0.4 * beatGlow})`; ctx.shadowBlur = 30; }
      ctx.fillStyle = last ? YEL : '#151515'; ctx.strokeStyle = last ? YEL : 'rgba(255,204,41,0.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, cy - 75, bw, 150, 14); ctx.fill(); ctx.stroke(); ctx.restore();
      txt(WD[i], x + bw / 2, cy - 33, '700 22px Inter', last ? INK : GREY, 'center');
      txt(DAYS[i], x + bw / 2, cy + 42, '700 60px Syne', last ? INK : WHITE, 'center');
    });
  }
  ctx.restore();
}
function render(t) {
  W = 1080; H = 1920;
  bgBlack([[540, 900, 0.10 + (t > DROP ? 0.08 : 0.04 * (t % BEAT < 0.1)), 750]]);
  tape(0, 1760, 1080, 1680, YEL, INK, 'SÓ ATÉ 08/11  •  BLACK SAND WALK  •  ', 56, 26, t * 70);
  logo(540, 150, 260, 'center');
  const m = eio(prog(t, DROP, DROP + 0.5));
  calendar(t, lerp(900, 375, m), lerp(1, 0.8, m));
  if (t < DROP + 0.4) {
    ctx.save(); ctx.globalAlpha = 1 - prog(t, DROP, DROP + 0.25);
    scaled(540, 730, pop(t, 0.02, 0.3), 1, () => txt('SÓ 7 DIAS', 540, 770, '700 140px Syne', WHITE, 'center'));
    ctx.globalAlpha *= enter(t, 4 * BEAT, 0.3);
    txt('DE BLACK SAND WALK', 540, 1070, '700 56px Syne', YEL, 'center');
    ctx.restore();
  }
  if (t >= DROP) {
    scaled(540, 240, pop(t, DROP), 1, () => seal(540, 255, 'SÓ 7 DIAS', 32, -0.03, YEL, INK, 'center'));
    const k = Math.floor((t - DROP) / BEAT), key = ROT[k % ROT.length];
    scaled(540, 640, pop(t, DROP + 0.1, 0.35) * (0.94 + 0.06 * pop(t, DROP + k * BEAT, 0.15)), 1, () => sunga(key, 540, 640, 400, 0, { spot: 0.34 }));
    offerStack(t, DROP + BEAT, 890, { size: 170, gap: [0, BEAT, 2 * BEAT, 3 * BEAT] });
    ctaPulse(t, DROP + 4 * BAR, 1240, 'GARANTIR AS MINHAS  →', BEAT * 2);
    ctx.save(); ctx.globalAlpha = enter(t, DROP + 4 * BAR + BEAT, 0.4); footer(1330, 24); ctx.restore();
  }
  flash(t, DROP, 0.2, 0.85, '255,204,41');
}
window.ready = (async () => { await loadCommon(); render(0); return true; })();
window.renderAt = t => render(t);
