// Renders a transparent overlay page frame by frame and composites it over the original video with its original audio.
// Usage: PAGE=benz.html SRC=src/benz.mp4 OUT=out/x.mp4 node render_overlay.js video
//        PAGE=benz.html SRC=src/benz.mp4 node render_overlay.js stills 0 6.5 ...   -> build/still_<page>_<t>.png (composited)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path');

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  const PAGE = process.env.PAGE, SRC = process.env.SRC, FPS = 30;
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', SRC]).toString());
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, PAGE));
  await page.evaluate(() => window.ready);
  const canvas = await page.$('#c');
  const shot = () => canvas.screenshot({ type: 'png', omitBackground: true });
  const base = ['-i', SRC];
  const scale = '[0:v]scale=1080:1920:flags=lanczos,setsar=1[b];[b][1:v]overlay=0:0:format=auto';

  if (mode === 'stills') {
    for (const t of rest) {
      await page.evaluate(t => window.renderAt(t), parseFloat(t));
      const png = await shot();
      const out = path.join(__dirname, 'build', `still_${PAGE.replace('.html', '')}_${t}.png`);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-ss', t, ...base, '-f', 'png_pipe', '-i', '-', '-filter_complex', scale, '-frames:v', '1', out]);
      ff.stdin.end(png); await new Promise(r => ff.on('close', r));
    }
  } else {
    const n = Math.round(dur * FPS);
    const out = process.env.OUT;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...base, '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-filter_complex', scale + ',format=yuv420p[v]', '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
      '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.renderAt(t), i / FPS);
      const buf = await shot();
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) process.stdout.write(`frame ${i}/${n}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out);
  }
  await browser.close();
})();
