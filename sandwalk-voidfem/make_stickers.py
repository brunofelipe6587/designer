# Die-cut "stickers" of the kit pieces for vf2.html, cut from the store image (src/kit_frente.png, transparent PNG):
# long sleeve, short sleeve, shorts, the full kit and a round swatch of the print. The two shirts touch at the
# shoulders, so they are separated row by row through the gap between them, then each piece gets a
# white outline (dilated alpha) like a sticker. Written to build/st_*.png at 2x.
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
im = Image.open('src/kit_frente.png').convert('RGBA')
W, H = im.size
a = np.asarray(im)[:, :, 3]
yy, xx = np.mgrid[0:H, 0:W]
# per row, split in the middle of the widest empty run between the shirts (x 420–560); rows where they touch take the
# nearest row's split
on = a > 40
splits = np.full(H, np.nan)
for y in range(182, 600):
    row = on[y, 420:560]; best = (0, None); run = 0
    for x in range(len(row)):
        run = run + 1 if not row[x] else 0
        if run > best[0]: best = (run, x - run // 2 + 420)
    if best[0] >= 3: splits[y] = best[1]
ok = ~np.isnan(splits); idx = np.arange(H)
splits = np.interp(idx, idx[ok], splits[ok])
split = splits[:, None] * np.ones((1, W))
regions = {
    'ls': (yy < 600) & (xx < split),
    'ss': (yy < 600) & (xx >= split),
    'sh': (yy >= 600),
    'full': np.ones_like(a, bool),
}
def sticker(mask, name, scale=2, stroke=14):
    arr = np.asarray(im).copy(); arr[:, :, 3] = np.where(mask, arr[:, :, 3], 0)
    piece = Image.fromarray(arr)
    bb = piece.getbbox(); pad = stroke + 6
    piece = piece.crop((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad))
    piece = piece.resize((piece.width * scale, piece.height * scale), Image.LANCZOS)
    al = piece.split()[3].point(lambda v: 255 if v > 60 else 0)
    k = stroke * scale * 2 + 1
    outline = al.filter(ImageFilter.MaxFilter(min(k, 61)))
    if k > 61: outline = outline.filter(ImageFilter.MaxFilter(k - 60 if (k - 60) % 2 else k - 59))
    outline = outline.filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new('RGBA', piece.size, (255, 255, 255, 0)); white = Image.new('RGBA', piece.size, (255, 255, 255, 255))
    out.paste(white, (0, 0), outline); out.alpha_composite(piece)
    out.save(f'build/st_{name}.png'); print(name, out.size)
def keep_component(mask, seed):
    # geodesic flood fill from a seed point: drops stray bits of the neighbouring shirt that the split left behind
    m = mask & (a > 40); out = np.zeros_like(m); out[seed[1], seed[0]] = True
    while True:
        g = out.copy()
        g[1:] |= out[:-1]; g[:-1] |= out[1:]; g[:, 1:] |= out[:, :-1]; g[:, :-1] |= out[:, 1:]
        g &= m
        if (g == out).all(): break
        out = g
    return out | (mask & (a <= 40) & False)
regions['ls'] = keep_component(regions['ls'], (330, 390))
regions['ss'] = keep_component(regions['ss'], (630, 390))
for n, m in regions.items(): sticker(m, n, stroke=12 if n == 'full' else 14)
# round print swatch from the short sleeve's body
cx, cy, r = 645, 480, 62
sw = im.crop((cx - r, cy - r, cx + r, cy + r)).resize((560, 560), Image.LANCZOS)
m = Image.new('L', (560, 560), 0); ImageDraw.Draw(m).ellipse((0, 0, 559, 559), fill=255)
sw.putalpha(m)
out = Image.new('RGBA', (620, 620), (0, 0, 0, 0)); ImageDraw.Draw(out).ellipse((0, 0, 619, 619), fill=(255, 255, 255, 255))
out.alpha_composite(sw, (30, 30)); out.save('build/st_print.png'); print('print', out.size)
