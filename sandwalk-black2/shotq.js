// Usage: node shotq.js page.html out.jpg c   -> screenshot of the canvas for creative c (page?c=c)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const [page, out, c] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 2000 } });
  p.on('pageerror', e => console.log('pageerror:', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await p.goto('file://' + path.join(__dirname, page) + '?c=' + c); await p.evaluate(() => window.ready);
  await (await p.$('#c')).screenshot({ path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', quality: out.endsWith('.jpg') ? 93 : undefined });
  await b.close();
})();
