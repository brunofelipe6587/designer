// Usage: node render_static.js  -> out/FagnerDavi_GrupoVIP_{Feed_1080x1350,Story_1080x1920}.png (+ build/*_guides.png for review)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const jobs = [
    ['feed', 1350, 'out/FagnerDavi_GrupoVIP_Feed_1080x1350.png'],
    ['story', 1920, 'out/FagnerDavi_GrupoVIP_Story_1080x1920.png'],
  ];
  for (const [fmt, h, file] of jobs) {
    for (const g of [0, 1]) {
      const page = await browser.newPage({ viewport: { width: 1080, height: h }, deviceScaleFactor: 1 });
      await page.goto('file://' + path.join(__dirname, 'static.html') + `?fmt=${fmt}&guides=${g}`);
      await page.evaluate(() => window.ready);
      const out = g ? `build/${fmt}_guides.png` : file;
      await (await page.$('#c')).screenshot({ path: path.join(__dirname, out) });
      console.log(out);
      await page.close();
    }
  }
  await browser.close();
})();
