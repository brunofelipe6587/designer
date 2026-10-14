// Usage: node render_statics.js [id ...]   -> out/estaticos/<name>.jpg (every .slide when no id given)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const NAMES = {
  s1: 'JustCo_Pietro_4x5_S1_No1EmVendas', s2: 'JustCo_Pietro_4x5_S2_DiasAmenos',
  s3: 'JustCo_Pietro_4x5_S3_EscolhaASuaCor', s4: 'JustCo_Pietro_9x16_S4_No1EmVendas_Stories',
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
    const file = path.join(outDir, (NAMES[id] || id) + '.jpg');
    await (await page.$('#' + id)).screenshot({ path: file, type: 'jpeg', quality: 94 });
    console.log('ok', path.relative(__dirname, file));
  }
  await browser.close();
})();
