// Usage: node render_banners.js [id ...]  -> out/banners/<name>.jpg at 2x (desktop 3840×1920, mobile 2160×3840)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const NAMES = {
  a_desk: 'JustCo_Banner_Verao_A_Desktop_3840x1920', b_desk: 'JustCo_Banner_Verao_B_Desktop_3840x1920',
  a_mob: 'JustCo_Banner_Verao_A_Mobile_2160x3840', b_mob: 'JustCo_Banner_Verao_B_Mobile_2160x3840',
};

(async () => {
  const outDir = path.join(__dirname, 'out', 'banners');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 2100, height: 2100 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'banners.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(NAMES);
  for (const id of ids) {
    const file = path.join(outDir, NAMES[id] + '.jpg');
    await (await page.$('#' + id)).screenshot({ path: file, type: 'jpeg', quality: 92 });
    console.log('ok', path.relative(__dirname, file));
  }
  await browser.close();
})();
