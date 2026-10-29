// V1 · Trio (phonk 128 bpm, beat_shd2.wav — bars of 1.875 s, drop at 3.75 s, outro at 11.25 s).
// The three partner athletes enter one per beat, "a Black da areia chegou" word by word, the offer lands on the drop,
// a sunga carousel takes the athletes' place for two bars, then everything comes back with the CTA.
const BEAT = 60 / 128, BAR = 4 * BEAT, DROP = 2 * BAR, CAR = 4 * BAR, OUTRO = 6 * BAR, DUR = 15.6;
const ROT = ['blackout', 'hupi_fire', 'graffiti', 'shadow', 'splash', 'allblack', 'pincelada_fluor', 'stars', 'shadow_laranja', 'tricolor', 'grafite_premium'];
function athletes(t, dim) {
  const u3 = enter(t, BEAT, 0.35), u1 = enter(t, 2 * BEAT, 0.35), u2 = enter(t, 3 * BEAT, 0.4);
  ctx.save(); ctx.globalAlpha = dim;
  if (u3 > 0) athlete('a3', -75 - 320 * (1 - u3), 300, 0.44, { alpha: u3 });
  if (u1 > 0) athlete('a1', 650 + 320 * (1 - u1), 290, 0.58, { alpha: u1 });
  if (u2 > 0) athlete('a2', 205, 285 + 140 * (1 - u2), 0.45, { alpha: u2 });
  ctx.restore();
}
function render(t) {
  W = 1080; H = 1920;
  const zoom = 1 + 0.02 * Math.sin(t * 0.6);
  bgBlack([[540, 600, 0.12 + 0.05 * (t > DROP) * Math.max(0, Math.cos(((t - DROP) % BEAT) / BEAT * Math.PI)), 800], [540, 1150, 0.16, 700]]);
  // athletes (dimmed while the carousel is up)
  const dim = t < CAR ? 1 : t < OUTRO ? 1 - 0.8 * enter(t, CAR, 0.3) : 0.2 + 0.8 * enter(t, OUTRO, 0.4);
  ctx.save(); ctx.translate(540, 600); ctx.scale(zoom, zoom); ctx.translate(-540, -600); athletes(t, dim); ctx.restore();
  vfade(640, 870, 0, 1); ctx.fillStyle = '#050505'; ctx.fillRect(0, 870, W, H - 870);
  // sunga carousel: three slots, prints change every two beats, staggered
  if (t >= CAR - 0.05 && t < OUTRO + 0.4) {
    const a = t < OUTRO ? enter(t, CAR, 0.3) : 1 - enter(t, OUTRO, 0.35);
    ctx.save(); ctx.globalAlpha = a;
    txt('ESTAMPAS PRA TODO ESTILO', 540, 345, '700 50px Syne', WHITE, 'center');
    for (let i = 0; i < 3; i++) {
      const k = Math.floor((t - CAR) / (2 * BEAT) + i * 0.34), key = ROT[(((k * 3 + i) % ROT.length) + ROT.length) % ROT.length];
      const p = pop(t, CAR + i * BEAT * 0.5 + Math.max(0, k) * 2 * BEAT - i * BEAT * 0.68 * 0, 0.3);
      scaled(200 + i * 340, 560, 0.85 + 0.15 * p, 1, () => sunga(key, 200 + i * 340, 560, 300, (i - 1) * 0.06, { spot: 0.3 }));
    }
    ctx.restore();
  }
  // ribbons enter on the drop
  if (t >= DROP) {
    const u = enter(t, DROP, 0.5), sh = (t - DROP) * 80;
    ctx.save(); ctx.globalAlpha = u;
    tape(-600 * (1 - u), 905, 1080, 790, '#141414', 'rgba(255,204,41,0.65)', 'BLACK SAND WALK  •  ', 52, 25, -sh);
    tape(0, 850, 1080 + 600 * (1 - u), 770, YEL, INK, 'BLACK SAND WALK  •  3 SUNGAS POR R$ 179  •  ', 56, 26, sh);
    ctx.restore();
  }
  // header
  logo(540, 150, 280, 'center', enter(t, 0, 0.5));
  scaled(540, 250, pop(t, 0.02), 1, () => seal(540, 250, 'BLACK SAND WALK', 34, -0.03, YEL, INK, 'center'));
  // hook words before the drop
  if (t < DROP) {
    const words = [['A BLACK', BAR], ['DA AREIA', BAR + BEAT], ['CHEGOU', BAR + 2 * BEAT]];
    words.forEach(([w, t0], i) => scaled(540, 1000 + i * 110, pop(t, t0, 0.3), 1, () => txt(w, 540, 1035 + i * 110, '700 104px Syne', i === 2 ? YEL : WHITE, 'center')));
  } else {
    offerStack(t, DROP, 975, { size: 165, gap: [0, BEAT, 3 * BEAT, 4 * BEAT] });
    ctaPulse(t, DROP + 6 * BEAT, 1262, 'APROVEITAR OFERTA  →', BEAT);
    ctx.save(); ctx.globalAlpha = enter(t, DROP + 7 * BEAT, 0.4); footer(1352, 24); ctx.restore();
  }
  // bottom ribbon (decor under the Reels caption area)
  tape(0, 1780, 1080, 1700, '#121212', 'rgba(255,204,41,0.5)', 'SÓ ATÉ 08/11  •  BLACK SAND WALK  •  ', 50, 24, t * 60);
  // decorative sungas row below the safe area in the outro
  if (t >= OUTRO) {
    const ks = ['allblack', 'graffiti', 'blackout', 'hupi_fire'];
    ks.forEach((k, i) => { const p = pop(t, OUTRO + i * BEAT * 0.5, 0.35); scaled(165 + i * 250, 1530, p, 1, () => sunga(k, 165 + i * 250, 1530, 220, (i - 1.5) * 0.05, { spot: 0.22 })); });
  }
  flash(t, 0, 0.25, 0.6); flash(t, DROP, 0.22, 0.85); flash(t, CAR, 0.15, 0.4); flash(t, OUTRO, 0.15, 0.4, '255,204,41');
}
window.ready = (async () => { await loadCommon(); render(0); return true; })();
window.renderAt = t => render(t);
