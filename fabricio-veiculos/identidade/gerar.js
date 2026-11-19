// Peças de marca Fabrício Veículos (identidade azul) em alta resolução (2x).
// Uso: node gerar.js   ->  ../out/identidade/
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'out', 'identidade');
fs.mkdirSync(OUT, { recursive: true });
const ESCALA = 2;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const pecas = [
    ['perfil', {}, 'Fabricio_Perfil_Logo'],
    ['perfil', { slogan: true }, 'Fabricio_Perfil_Logo_Slogan'],
    ['capa', {}, 'Fabricio_Capa_Facebook'],
  ];
  for (const [kind, opt, nome] of pecas) {
    const p = await b.newPage({ viewport: { width: 1640, height: 1640 }, deviceScaleFactor: ESCALA });
    await p.goto('file://' + path.join(__dirname, 'marca.html'));
    const { W, H } = await p.evaluate(([k, o]) => window.render(k, o), [kind, opt]);
    const f = path.join(OUT, `${nome}_${W * ESCALA}x${H * ESCALA}.png`);
    await p.screenshot({ path: f, clip: { x: 0, y: 0, width: W, height: H } });
    console.log(path.relative(OUT, f));
    await p.close();
  }
  // logo sozinho, fundo transparente, 4000px de largura
  const svg = path.join(__dirname, '..', 'assets', 'logo_fabricio_azul.svg');
  const [vw, vh] = fs.readFileSync(svg, 'utf8').match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
  const LW = 4000, LH = Math.round(LW * vh / vw);
  const p = await b.newPage({ viewport: { width: LW, height: LH } });
  await p.goto('file://' + svg);
  const f = path.join(OUT, `Fabricio_Logo_Transparente_${LW}x${LH}.png`);
  await p.screenshot({ path: f, omitBackground: true, clip: { x: 0, y: 0, width: LW, height: LH } });
  console.log(path.relative(OUT, f));
  fs.copyFileSync(svg, path.join(OUT, 'Fabricio_Logo_Vetor.svg'));
  await b.close();
})();
