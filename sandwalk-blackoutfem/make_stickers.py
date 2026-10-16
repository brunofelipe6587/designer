# Die-cut "stickers" of the Blackout kit pieces for bo2.html, from the store image cut out of its white background
# (build/kit_cut.png, made by prep_bo.sh). Worked at half size (1000x1500). The two rash guards touch at the sleeves, so
# they are split row by row through the rightmost gap between them and each keeps only its connected part; every piece gets a
# white outline. Also a round swatch of the "FUTE VÔLEI" print. Written to build/st_*.png.
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
im = Image.open('build/kit_cut.png').convert('RGBA'); im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
W, H = im.size
a = np.asarray(im)[:, :, 3]; on = a > 40
yy, xx = np.mgrid[0:H, 0:W]
SH_Y = 975                                    # shirts above, shorts below
splits = np.full(H, np.nan)
for y in range(320, SH_Y):
    # rightmost empty run: the long sleeve hangs away from its own torso, so the widest gap can be inside that shirt
    row = on[y, 440:640]; runs = []; run = 0
    for x in range(len(row)):
        if not row[x]: run += 1
        else:
            if run >= 3: runs.append((x - run, x - 1))
            run = 0
    if run >= 3: runs.append((len(row) - run, len(row) - 1))
    if runs: splits[y] = (runs[-1][0] + min(runs[-1][1], runs[-1][0] + 40)) / 2 + 440
ok = ~np.isnan(splits); idx = np.arange(H)
split = (np.interp(idx, idx[ok], splits[ok]))[:, None] * np.ones((1, W))
def grow(out, m=None):
    g = out.copy(); g[1:] |= out[:-1]; g[:-1] |= out[1:]; g[:, 1:] |= out[:, :-1]; g[:, :-1] |= out[:, 1:]
    return g & m if m is not None else g
def keep_component(mask, seed):
    # connectivity on solid pixels only (the soft cut-out edge would bridge neighbouring bits), then the edge is added back
    m = mask & (a > 128); out = np.zeros_like(m); out[seed[1], seed[0]] = True
    while True:
        g = grow(out, m)
        if (g == out).all(): break
        out = g
    for _ in range(3): out = grow(out)
    return out & mask
regions = {
    'ls': keep_component((yy < SH_Y) & (xx < split), (300, 600)),
    # the long sleeve's cuff tip touches the short sleeve's hem: keep that corner out of the short sleeve
    'ss': keep_component((yy < SH_Y) & (xx >= split) & ~((yy > 885) & (xx < 572)), (740, 600)),
    'sh': (yy >= SH_Y),
    'full': np.ones_like(on),
}
def sticker(mask, name, stroke=14):
    arr = np.asarray(im).copy(); arr[:, :, 3] = np.where(mask, arr[:, :, 3], 0)
    piece = Image.fromarray(arr); bb = piece.getbbox(); pad = stroke + 6
    piece = piece.crop((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad))
    al = piece.split()[3].point(lambda v: 255 if v > 60 else 0)
    outline = al.filter(ImageFilter.MaxFilter(stroke * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new('RGBA', piece.size, (255, 255, 255, 0)); white = Image.new('RGBA', piece.size, (255, 255, 255, 255))
    out.paste(white, (0, 0), outline); out.alpha_composite(piece)
    out.save(f'build/st_{name}.png'); print(name, out.size)
for n, m in regions.items(): sticker(m, n, stroke=12 if n == 'full' else 14)
# round swatch of the FUTE VÔLEI print on the short-sleeve chest
cx, cy, r = 745, 490, 115
sw = im.crop((cx - r, cy - r, cx + r, cy + r)).resize((560, 560), Image.LANCZOS)
bg = Image.new('RGBA', (560, 560), (20, 20, 22, 255)); bg.alpha_composite(sw)
m = Image.new('L', (560, 560), 0); ImageDraw.Draw(m).ellipse((0, 0, 559, 559), fill=255); bg.putalpha(m)
out = Image.new('RGBA', (620, 620), (0, 0, 0, 0)); ImageDraw.Draw(out).ellipse((0, 0, 619, 619), fill=(255, 255, 255, 255))
out.alpha_composite(bg, (30, 30)); out.save('build/st_print.png'); print('print', out.size)
