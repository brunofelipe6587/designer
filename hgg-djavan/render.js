// Usage: node render.js stills 1.0 4.2 ...   -> build/still_<t>.png
//        node render.js video [fps]          -> out/video_silent.mp4
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'video.html'));
  await page.evaluate(() => window.ready);
  const canvas = await page.$('#c');

  if (mode === 'stills') {
    for (const t of rest) {
      await page.evaluate(t => window.renderAt(t), parseFloat(t));
      await canvas.screenshot({ path: path.join(__dirname, 'build', `still_${t}.png`) });
    }
  } else {
    const fps = parseInt(rest[0] || '30', 10), dur = 23.2, n = Math.round(dur * fps);
    const out = path.join(__dirname, 'out', 'video_silent.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.renderAt(t), i / fps);
      const buf = await canvas.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stdout.write(`frame ${i}/${n}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out);
  }
  await browser.close();
})();
