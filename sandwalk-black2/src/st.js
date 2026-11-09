// Black Sand Walk · semana 2 — 7 static creatives for the women's kits (15% OFF), each in two formats:
// feed 1080×1350 and Reels/Stories 1080×1920 (essentials inside y 270–1250, side margins 65). The page is opened with
// ?c=<1..7>; H decides the format. Y(feed, reels) picks the coordinate for the current format.
const C = +(new URLSearchParams(location.search).get('c') || 1);
const RL = H === 1920, Y = (f, r) => RL ? r : f;
const PINK = '#FF5FA8';
function priceRow(cx, y, size = 1) {
  ctx.font = `600 ${34 * size}px Inter`; const a = 'de ' + OFF.from, aw = ctx.measureText(a).width;
  ctx.font = `700 ${64 * size}px Syne`; const b = 'por ' + OFF.to, bw = ctx.measureText(b).width; const x0 = cx - (aw + 22 * size + bw) / 2;
  strike(a, x0, y, `600 ${34 * size}px Inter`); glowTxt(b, x0 + aw + 22 * size, y + 2, `700 ${64 * size}px Syne`, YEL, 30, 0.45);
}
function piecesLine(y, color = '#CFCFCF', size = 30) { txt('Manga longa + manga curta + shorts', 540, y, `600 ${size}px Inter`, color, 'center'); }
function datesPill(y, filled = false) { pill('SÓ DE ' + OFF.dates.toUpperCase(), 540, y, 26, filled, 'center'); }
const S = {
  // 1 · 15% OFF hero with the 3 best sellers
  1() {
    bgBlack([[540, Y(700, 860), 0.20, 760]]);
    logo(540, Y(54, 120), 260, 'center');
    seal(540, Y(150, 320), 'BLACK SAND WALK', 30, -0.03, YEL, INK, 'center');
    txt('KITS FEMININOS', 540, Y(250, 420), '700 62px Syne', WHITE, 'center');
    glowTxt(OFF.pct, 540, Y(430, 590), '700 190px Syne', YEL, 60, 0.6, 'center');
    const ky = Y(720, 815), kw = Y(330, 300);
    kit('void', 245, ky + 20, kw * 0.88, -0.06, { spot: 0.22 }); kit('everflame', 835, ky + 20, kw * 0.88, 0.06, { spot: 0.22 });
    kit('blackout', 540, ky, kw, 0, { spot: 0.32 });
    priceRow(540, Y(1000, 1050)); piecesLine(Y(1050, 1100));
    cta('COMPRAR COM 15% OFF  →', 540, Y(1140, 1195), 640, 88, 33);
    if (RL) { txt('Válido de 09 a 15/11', 540, 1300, '600 26px Inter', '#9A9A9A', 'center'); ['egypt', 'rhythm', 'vivid', 'brasil'].forEach((k, i) => kit(k, 165 + i * 250, 1480, 200, (i - 1.5) * 0.04, { spot: 0.18 })); }
    else txt('Válido de 09 a 15/11', 540, 1240, '600 26px Inter', '#9A9A9A', 'center');
  },
  // 2 · the 3 best sellers on a podium
  2() {
    bgBlack([[540, Y(760, 900), 0.18, 760]]);
    logo(540, Y(54, 120), 240, 'center');
    seal(540, Y(140, 315), 'BLACK SAND WALK', 28, -0.03, YEL, INK, 'center');
    txt('OS 3 KITS FEMININOS', 540, Y(240, 410), '700 58px Syne', WHITE, 'center');
    txt('MAIS VENDIDOS', 540, Y(310, 478), '700 58px Syne', YEL, 'center');
    // three cards: 1º in the middle and taller, medal on the card's top-left, name under the kit
    const cards = [[540, 'blackout', 1, 330, 470], [205, 'void', 2, 290, 410], [875, 'everflame', 3, 290, 410]], cy = Y(700, 790);
    for (const [x, k, n, w, h] of cards) {
      const top = cy - h / 2 + (n === 1 ? -20 : 20);
      ctx.save(); if (n === 1) { ctx.shadowColor = 'rgba(255,204,41,0.4)'; ctx.shadowBlur = 30 * FX; }
      ctx.fillStyle = '#121212'; ctx.strokeStyle = n === 1 ? YEL : '#2C2C2C'; ctx.lineWidth = n === 1 ? 4 : 2;
      ctx.beginPath(); ctx.roundRect(x - w / 2, top, w, h, 20); ctx.fill(); ctx.stroke(); ctx.restore();
      kit(k, x, top + h * 0.45, w * 0.86, 0, { spot: n === 1 ? 0.3 : 0.2 });
      txt(KIT_NAME[k].toUpperCase(), x, top + h - 26, '800 24px Inter', n === 1 ? YEL : '#D0D0D0', 'center');
      medal(x - w / 2 + 34, top + 34, n);
    }
    txt('agora com', 540, Y(1000, 1050), '600 32px Inter', WHITE, 'center');
    glowTxt(OFF.pct, 540, Y(1095, 1140), '700 96px Syne', YEL, 40, 0.55, 'center');
    cta('GARANTIR O MEU  →', 540, Y(1190, 1205), 600, 80, 32);
    txt(`${OFF.from} → ${OFF.to} · ${OFF.datesLong}`, 540, Y(1290, 1300), '600 26px Inter', '#9A9A9A', 'center');
  },
  // 3 · grid with 9 prints
  3() {
    bgBlack([[540, Y(700, 760), 0.14, 700]], false);
    logo(540, Y(46, 110), 230, 'center');
    seal(540, Y(128, 310), 'BLACK SAND WALK', 26, -0.03, YEL, INK, 'center');
    glowTxt(OFF.pct, 540, Y(270, 430), '700 120px Syne', YEL, 40, 0.55, 'center');
    txt('NOS KITS FEMININOS', 540, Y(330, 488), '700 44px Syne', WHITE, 'center');
    const ks = KITS.slice(0, 9), cw = 300, ch = Y(232, 196), gap = 14, gx = 540 - (3 * cw + 2 * gap) / 2, gy = Y(370, 520);
    ks.forEach((k, i) => {
      const c = i % 3, r = Math.floor(i / 3), x = gx + c * (cw + gap), y = gy + r * (ch + gap);
      ctx.fillStyle = '#121212'; ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 16); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 16); ctx.clip(); kit(k, x + cw / 2, y + ch / 2 - 8, ch * 0.95, 0, { spot: 0.2, rimA: 0.35 }); ctx.restore();
      txt(KIT_NAME[k].toUpperCase(), x + cw / 2, y + ch - 10, '700 17px Inter', '#BDBDBD', 'center');
    });
    const yb = gy + 3 * ch + 2 * gap;
    priceRow(540, yb + Y(70, 60), 0.85);
    cta('ESCOLHER O MEU  →', 540, Y(yb + 140, 1205), 600, 80, 32);
    txt('Válido de 09 a 15/11', 540, Y(1305, 1300), '600 24px Inter', '#9A9A9A', 'center');
  },
  // 4 · the best seller alone, price per piece
  4() {
    bgBlack([[560, Y(560, 700), 0.20, 700]]);
    logo(70, Y(56, 120), 240);
    seal(70, Y(160, 320), 'BLACK SAND WALK', 26, -0.04);
    txt('O MAIS VENDIDO', 70, Y(255, 420), '700 40px Syne', YEL);
    txt('KIT BLACKOUT', 70, Y(320, 485), '700 64px Syne', WHITE);
    kit('blackout', 540, Y(640, 760), Y(560, 520), 0, { spot: 0.34 });
    ctx.save(); ctx.translate(Y(905, 905), Y(205, 360)); ctx.rotate(-0.12); ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(0, 0, 95, 0, Math.PI * 2); ctx.fill();
    txt('15%', 0, 8, '700 66px Syne', INK, 'center'); txt('OFF', 0, 52, '800 30px Inter', INK, 'center'); ctx.restore();
    priceRow(540, Y(960, 1010));
    txt('3 peças: sai R$ 53,75 cada', 540, Y(1018, 1068), '700 34px Inter', WHITE, 'center');
    cta('QUERO O KIT BLACKOUT  →', 540, Y(1115, 1180), 640, 86, 32);
    txt('Manga longa + manga curta + shorts · válido de 09 a 15/11', 540, Y(1200, 1290), '600 22px Inter', '#9A9A9A', 'center');
  },
  // 5 · outfit check over a still from the women's futevôlei footage
  async 5() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const im = await load('../sandwalk-voidfem/frames/m1/0017.jpg');
    const s = Math.max(W / im.width, H / im.height); ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2 - Y(80, 0), im.width * s, im.height * s);
    ctx.fillStyle = 'rgba(0,0,0,0.30)'; ctx.fillRect(0, 0, W, H); vfade(0, Y(560, 760), 0.92, 0); vfade(Y(560, 900), Y(1100, 1500), 0, 0.92); ctx.fillStyle = 'rgba(5,5,5,0.92)'; ctx.fillRect(0, Y(1100, 1500), W, H);
    seal(70, Y(70, 320), 'BLACK SAND WALK', 28, -0.04);
    txt('OUTFIT CHECK', 70, Y(200, 440), '700 84px Syne', WHITE);
    txt('DA AREIA', 70, Y(285, 525), '700 84px Syne', YEL);
    const items = ['Manga longa', 'Manga curta', 'Shorts', OFF.pct];
    items.forEach((it, i) => {
      const y = Y(700, 800) + i * 74, last = i === 3;
      ctx.fillStyle = last ? YEL : 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(70, y - 46, last ? 380 : 360, 62, 14); ctx.fill();
      txt('✓', 100, y - 2, '800 34px Inter', last ? INK : YEL); txt(it, 150, y - 2, `800 ${last ? 34 : 32}px Inter`, last ? INK : WHITE);
    });
    kit('blackout', 820, Y(860, 960), 330, 0.04, { spot: 0.1 });
    priceRow(540, Y(1060, 1130));
    cta('QUERO MEU KIT  →', 540, Y(1160, 1205), 600, 84, 33);
    txt('Kits femininos com 15% OFF · de 09 a 15/11', 540, Y(1260, 1300), '600 24px Inter', '#BDBDBD', 'center');
  },
  // 6 · yellow pattern break
  6() {
    ctx.fillStyle = YEL; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = 0.5; grain(); ctx.restore();
    ctx.save(); ctx.filter = 'invert(1)'; logo(540, Y(50, 120), 240, 'center'); ctx.restore();
    seal(540, Y(140, 320), 'BLACK SAND WALK', 26, 0, INK, YEL, 'center');
    txt('KITS FEMININOS', 540, Y(240, 420), '700 66px Syne', INK, 'center');
    txt(OFF.pct, 540, Y(420, 600), '700 190px Syne', INK, 'center');
    const ks = ['void', 'blackout', 'everflame', 'rhythm'], xs = [160, 410, 670, 920];
    ks.forEach((k, i) => {
      const y = Y(650, 790) + (i % 2) * 24;
      ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(xs[i] - 118, y - 135, 236, 270, 18); ctx.fill();
      kit(k, xs[i], y - 6, 220, 0, { spot: 0.18, rimA: 0.35 });
    });
    ctx.font = '700 34px Inter'; const a = 'de ' + OFF.from, aw = ctx.measureText(a).width; ctx.font = '700 64px Syne'; const bw = ctx.measureText('por ' + OFF.to).width;
    const x0 = 540 - (aw + 22 + bw) / 2;
    strike(a, x0, Y(900, 1030), '700 34px Inter', 'rgba(10,10,10,0.6)', 'rgba(10,10,10,0.7)'); txt('por ' + OFF.to, x0 + aw + 22, Y(902, 1032), '700 64px Syne', INK);
    txt('Manga longa + manga curta + shorts', 540, Y(955, 1085), '600 30px Inter', INK, 'center');
    ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(540 - 310, Y(1010, 1150), 620, 88, 14); ctx.fill();
    txt('APROVEITAR 15% OFF  →', 540, Y(1056, 1196), '800 33px Inter', YEL, 'center', 'middle');
    txt('Válido de 09 a 15/11', 540, Y(1140, 1300), '700 24px Inter', 'rgba(10,10,10,0.75)', 'center');
    if (!RL) { ['egypt', 'vivid', 'brasil', 'megawave', 'phoenix'].forEach((k, i) => { ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(40 + i * 204, 1180, 186, 140, 14); ctx.fill(); kit(k, 133 + i * 204, 1250, 150, 0, { spot: 0.15, rimA: 0.3 }); }); }
    else { ['egypt', 'vivid', 'brasil', 'megawave'].forEach((k, i) => { ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(50 + i * 250, 1380, 230, 230, 18); ctx.fill(); kit(k, 165 + i * 250, 1495, 200, 0, { spot: 0.15, rimA: 0.3 }); }); }
  },
  // 7 · urgency: the 7 days of the week
  7() {
    bgBlack([[540, Y(760, 860), 0.18, 760]]);
    logo(540, Y(46, 110), 230, 'center');
    txt('SÓ 7 DIAS', 540, Y(220, 400), '700 120px Syne', WHITE, 'center');
    const days = ['09', '10', '11', '12', '13', '14', '15'], wd = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
    const bw = 124, gap = 13, x0 = 540 - (7 * bw + 6 * gap) / 2, yy = Y(270, 450);
    for (let i = 0; i < 7; i++) {
      const x = x0 + i * (bw + gap), last = i === 6;
      ctx.fillStyle = last ? YEL : '#151515'; ctx.strokeStyle = last ? YEL : 'rgba(255,204,41,0.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, yy, bw, 130, 14); ctx.fill(); ctx.stroke();
      txt(wd[i], x + bw / 2, yy + 36, '700 22px Inter', last ? INK : GREY, 'center'); txt(days[i], x + bw / 2, yy + 100, '700 54px Syne', last ? INK : WHITE, 'center');
    }
    txt('NOVEMBRO', 540, Y(440, 615), '700 22px Inter', GREY, 'center');
    const ks = ['everflame', 'void', 'blackout', 'egypt', 'rhythm'], pos = [[150, -0.08], [930, 0.08], [345, -0.04], [735, 0.04], [540, 0]];
    for (const k of [0, 1, 2, 3, 4]) kit(ks[k], pos[k][0], Y(610, 760) + (k === 4 ? -10 : 0), k === 4 ? 250 : 220, pos[k][1], { spot: 0.2 });
    txt('KITS FEMININOS', 540, Y(860, 960), '700 58px Syne', WHITE, 'center');
    glowTxt(OFF.pct, 540, Y(990, 1075), '700 130px Syne', YEL, 50, 0.6, 'center');
    priceRow(540, Y(1065, 1140), 0.8);
    cta('GARANTIR ANTES DE DOMINGO  →', 540, Y(1160, 1205), 680, 84, 31);
    txt('Válido de 09 a 15/11', 540, Y(1260, 1300), '600 24px Inter', '#9A9A9A', 'center');
  },
};
window.ready = (async () => { await loadCommon(); await S[C](); return true; })();
