const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, '..', 'video.html'));
  await p.evaluate(() => window.ready);
  const res = [];
  for (let t = 6.0; t < 22.84; t += 0.25) {
    const m = await p.evaluate(async t => {
      await drawFootage(t);
      const d = document.getElementById('c').getContext('2d').getImageData(0, 1830, 1080, 90).data;
      let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 225 && d[i + 1] > 225 && d[i + 2] > 225) n++;
      return n;
    }, t);
    if (m > 0) res.push([t.toFixed(2), m]);
  }
  console.log('white px in bottom strip:', JSON.stringify(res));
  await b.close();
})();
