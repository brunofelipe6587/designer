// Mobile home banner — proportion of the site's mobile banner (480×987), drawn at 4.5× = 2160×4442: the most pixels
// the athlete photos give without upscaling (the left athlete is drawn at ~0.99 of his source resolution).
// Layout in 960×1974 units (K = 2.25 device px per unit).
// The 3 partner athletes stand side by side with no overlap (checked pixel by pixel when laid out), original pixels,
// no fades on their bodies: each body ends under the yellow ribbon; a side band covers the regata athlete's cut side. The shirtless athlete is turned 17° so he stands
// straight. The regata athlete is framed from the left edge of the banner — his photo's left side had the child, so
// that side stays outside the frame. Below: same offer block as the approved desktop.
const K = W / 960, LW = 960, LH = H / K;
// [file key, crop in source px, scale in layout units, rotation (deg, clockwise), x, y (top-left of the turned layer)]
// ORDER = draw order. [0, 2, 1]: the middle athlete in front, his ball over the crossed-arms athlete's forearms
// (approved). [0, 1, 2] would put the crossed-arms athlete in front with the ball mostly behind him.
// The side athletes sit 36 units in from the edges; the middle one's head is on the centre line (x 480).
const EDGE = 30, ORDER = [0, 2, 1];
const A1X = EDGE + 82;   // regata athlete moved in until his arm almost touches the middle athlete (~4 units apart)
const ATHS = [['a1', [1015, 330, 1600, 1600], 0.44, 0, A1X, 240],
              ['a2', [100, 100, 1855, 1600], 0.35, 17, 192, 208],
              ['a3', [280, 0, 1260, 1800], 0.34, 0, 960 - EDGE - (1222 - 280) * 0.34, 245]];
const RIB = [[0, 805], [LW, 758]];   // ribbon centre line = where the athletes' bodies end
function athLayer(key, [x0, y0, x1, y1], s, deg) {
  const img = IMG[key], d = s * K, w = (x1 - x0) * d, h = (y1 - y0) * d, a = deg * Math.PI / 180;
  const c = document.createElement('canvas');
  c.width = Math.ceil(Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))); c.height = Math.ceil(Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a)));
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
  g.translate(c.width / 2, c.height / 2); g.rotate(a); g.drawImage(img, x0, y0, x1 - x0, y1 - y0, -w / 2, -h / 2, w, h);
  const r = document.createElement('canvas'); r.width = c.width; r.height = c.height; const rg = r.getContext('2d');
  rg.drawImage(c, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = YEL; rg.fillRect(0, 0, r.width, r.height);
  return { c, r };
}
function athletes() {
  const L = ATHS.map(([k, crop, s, deg, x, y]) => ({ ...athLayer(k, crop, s, deg), x: x * K, y: y * K }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  // keep everything above the ribbon line (the ribbon covers the cut)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(LW * K, 0); ctx.lineTo(LW * K, RIB[1][1] * K); ctx.lineTo(0, RIB[0][1] * K); ctx.closePath(); ctx.clip();
  // rims first, then the athletes on top, so no glow ever lies over a body
  for (const l of L) { ctx.save(); ctx.globalAlpha = 0.5; ctx.filter = `blur(${14 * K}px)`; ctx.drawImage(l.r, l.x + 5 * K, l.y - 4 * K); ctx.restore(); }
  for (const i of ORDER) ctx.drawImage(L[i].c, L[i].x, L[i].y);
  ctx.restore();
}
// Side band "SÓ ATÉ 08/11" along the regata athlete's left side. His photo is cut there (the child was in front of
// him), with two small gaps by the neckline and the hand. The band's right edge passes 5 units left of his ear
// (y 375) and leans 15° so that, below the neck, it covers the cut line and the gaps; it never touches his face.
function sideBand() {
  const m = 0.27, xr = y => A1X + 5 + m * (y - 375), wHor = 100;          // right edge, horizontal width
  const c0 = [xr(-60) - wHor / 2, -60], c1 = [xr(900) - wHor / 2, 900];   // centre line
  // the band stops GAP units above the yellow ribbon's top edge (no contact with the horizontal ribbons)
  const GAP = 14, top = x => RIB[0][1] + (RIB[1][1] - RIB[0][1]) * x / LW - 32, end = x => top(x) - GAP;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(LW, -100); ctx.lineTo(LW, end(LW)); ctx.lineTo(0, end(0)); ctx.closePath(); ctx.clip();
  tape(c0[0], c0[1], c1[0], c1[1], YEL, INK, 'SÓ ATÉ 08/11  •  ', wHor * Math.cos(Math.atan(m)), 34, 0);
  ctx.restore();
  // between the band's end and the ribbon, under the band only, show the background (keeps the cut side hidden)
  // corners where the band's two edges meet the end line and the ribbon top (one fixed-point step is exact enough)
  const meet = (fy, edge) => { let y = fy(edge(760)); y = fy(edge(y)); return [edge(y), y]; };
  const xl = y => xr(y) - wHor, bot = x => top(x) + 4;
  const P = [meet(end, xl), meet(end, xr), meet(bot, xr), meet(bot, xl)];
  ctx.save();
  ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip();
  bgBlack([[480, 470, 0.12, 700], [480, 1300, 0.20, 700]]);
  ctx.restore();
}
function render() {
  ctx.setTransform(K, 0, 0, K, 0, 0); FX = K; W = LW; H = LH;
  bgBlack([[480, 470, 0.12, 700], [480, 1300, 0.20, 700]]);
  athletes();
  ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.moveTo(0, RIB[0][1]); ctx.lineTo(LW, RIB[1][1]); ctx.lineTo(LW, LH); ctx.lineTo(0, LH); ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(480, 1300, 40, 480, 1300, 700); g.addColorStop(0, 'rgba(255,204,41,0.16)'); g.addColorStop(1, 'rgba(255,204,41,0)');
  ctx.fillStyle = g; ctx.fillRect(0, RIB[1][1], LW, LH); grain();
  sideBand();
  // ribbons: dark one below, yellow one on the athletes' cut line
  tape(0, RIB[0][1] + 70, LW, RIB[1][1] + 70, '#141414', 'rgba(255,204,41,0.65)', 'BLACK SAND WALK  •  ', 56, 27);
  tape(RIB[0][0], RIB[0][1], RIB[1][0], RIB[1][1], YEL, INK, 'BLACK SAND WALK  •  3 SUNGAS POR R$ 179  •  ', 64, 29, 40);
  logo(480, 52, 300, 'center');
  seal(480, 145, 'BLACK SAND WALK', 34, -0.03, YEL, INK, 'center');
  // offer
  txt('3 SUNGAS POR', 480, 1010, '700 100px Syne', WHITE, 'center');
  glowTxt('R$ 179', 480, 1235, '700 230px Syne', YEL, 60, 0.55, 'center');
  ctx.font = '600 40px Inter'; const dw = ctx.measureText('De R$ 209,70').width; ctx.font = '800 32px Inter';
  const pw = ctx.measureText('ECONOMIZE R$ 30').width + 48, x0 = 480 - (dw + 32 + pw) / 2;
  strike('De R$ 209,70', x0, 1345, '600 40px Inter');
  pill('ECONOMIZE R$ 30', x0 + dw + 32, 1331, 32);
  sunga('blackout', 168, 1520, 280, -0.06, { reflect: true });
  sunga('graffiti', 480, 1508, 280, 0, { reflect: true });
  sunga('allblack', 792, 1520, 280, 0.06, { reflect: true });
  cta('APROVEITAR OFERTA  →', 480, 1755, 680, 112, 40);
  footer(1880, 27);
}
window.ready = (async () => { await loadCommon(); render(); return true; })();
