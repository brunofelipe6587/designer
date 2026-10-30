// Renders the catalog frame layers (frame / bg / preview) for one ratio page and saves exact PNGs (with alpha).
// Usage: node frames.js fr_1x1.html 1x1
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [page, tag] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 2000 } });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file://' + path.join(__dirname, page)); await p.evaluate(() => window.ready);
  for (const m of ['frame', 'bg', 'preview']) {
    const url = await p.evaluate(m => window.renderMode(m), m);
    fs.writeFileSync(path.join(__dirname, 'build', `frame_${tag}_${m}.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
})();
