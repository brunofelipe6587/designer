// Usage: node render_statics.js [id ...]   -> out/estaticos/<id>.png (every .slide when no id given)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const NAMES = {
  e1: 'JustCo_Verao_4x5_E1_VeraoTextoAtras', e2: 'JustCo_Verao_9x16_E2_VeraoStories',
  e3: 'JustCo_Verao_4x5_E3_NaoESobreOHelicoptero', e4: 'JustCo_Verao_4x5_E4_1Peca3Cores',
  e5: 'JustCo_Verao_4x5_E5_PrimeiraCompra10OFF', e6: 'JustCo_Verao_4x5_E6_RMK_ReparaNaTextura',
  e7: 'JustCo_Verao_4x5_E7_LookTricoCompleto',
  c1: 'JustCo_Verao_Carrossel_1x1_01', c2: 'JustCo_Verao_Carrossel_1x1_02', c3: 'JustCo_Verao_Carrossel_1x1_03',
  c4: 'JustCo_Verao_Carrossel_1x1_04', c5: 'JustCo_Verao_Carrossel_1x1_05',
};

(async () => {
  const outDir = path.join(__dirname, 'out', 'estaticos');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'statics.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : await page.$$eval('.slide', els => els.map(e => e.id));
  for (const id of ids) {
    const el = await page.$('#' + id);
    const file = path.join(outDir, (NAMES[id] || id) + '.png');
    await el.screenshot({ path: file });
    console.log('ok', path.relative(__dirname, file));
  }
  await browser.close();
})();
