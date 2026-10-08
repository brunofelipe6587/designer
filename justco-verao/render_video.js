// Usage: PAGE=v1.html node render_video.js stills 0.5 3 ...  -> build/still_<page>_<t>.png
//        PAGE=v1.html node render_video.js video [fps]        -> out/<page>_silent.mp4
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  const pageName = process.env.PAGE || 'v1.html', base = pageName.replace('.html', '');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, pageName));
  await page.evaluate(() => window.ready);
  const canvas = await page.$('#c');
  const dur = await page.evaluate(() => DUR);

  if (mode === 'stills') {
    for (const t of rest) {
      await page.evaluate(t => window.renderAt(t), parseFloat(t));
      await canvas.screenshot({ path: path.join(__dirname, 'build', `still_${base}_${t}.png`) });
    }
  } else {
    const fps = parseInt(rest[0] || '30', 10), n = Math.round(dur * fps);
    const out = path.join(__dirname, 'out', `${base}_silent.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.renderAt(t), i / fps);
      const buf = await canvas.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 90 === 0) process.stdout.write(`frame ${i}/${n}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out);
  }
  await browser.close();
})();
