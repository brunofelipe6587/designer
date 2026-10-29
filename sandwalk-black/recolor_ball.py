# Gives the ball in photo 2 a Sand Walk look: green panels -> black, yellow panels -> brand yellow #FFCC29, keeping the
# ball's own light, seams and texture (each pixel is recoloured by its luminance relative to its panel). Only ball
# pixels change: the Adobe ball mask (src/mask2_ball.png) excludes the hands; its 4 px fringe is recoloured only where
# the colour is the ball's (yellow/green hue), never skin. Then a small SW logo is laid on the big black panel,
# shaded with that panel's light. Input: src/atleta2_bola_sem_marca.png (brand figure already removed).
# Output: src/atleta2_bola_sw.png and build/cut2.png (same subject mask as before).
import numpy as np
from PIL import Image, ImageFilter
src = Image.open('src/atleta2_bola_sem_marca.png').convert('RGB'); A = np.asarray(src).astype(float) / 255
bm = Image.open('src/mask2_ball.png').convert('L')
core = np.asarray(bm).astype(float) / 255
band = np.asarray(bm.filter(ImageFilter.MaxFilter(9))).astype(float) / 255
r, g, b = A[..., 0], A[..., 1], A[..., 2]
mx, mn = A.max(2), A.min(2); d = mx - mn + 1e-6
h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
sat = d / (mx + 1e-6)
ballish = (h > 40) & (h < 170) & (sat > 0.25)                # yellow/green, not skin (skin hue ~15–35°)
weight = np.clip(np.maximum(core, band * ballish), 0, 1)
L = 0.299 * r + 0.587 * g + 0.114 * b
# panel class from a lightly smoothed copy (seams/grain don't flip it): yellow has r >= g, every green (light, shaded
# or olive) has g > r
Sm = np.asarray(src.filter(ImageFilter.GaussianBlur(3))).astype(float) / 255
rg = (Sm[..., 1] - Sm[..., 0]) / (Sm[..., 1] + Sm[..., 0] + 1e-6)
wg = np.maximum(np.clip((h - 72) / 18, 0, 1) * (sat > 0.3), np.clip((rg - 0.02) / 0.05, 0, 1))
wg = np.asarray(Image.fromarray((wg * 255).astype('uint8')).filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255
# the two green panels in the shadow at the lower right have the same r/g/b as shaded yellow, so they are traced by
# hand from the photo (polygons in source px)
from PIL import ImageDraw
pm = Image.new('L', src.size, 0); dr = ImageDraw.Draw(pm)
dr.polygon([(1575, 1215), (1613, 1209), (1637, 1217), (1639, 1237), (1635, 1277), (1622, 1300), (1600, 1323), (1580, 1338),
            (1573, 1343), (1574, 1283)], fill=255)
dr.polygon([(1573, 1350), (1550, 1363), (1520, 1377), (1495, 1389), (1493, 1403), (1507, 1407), (1527, 1397), (1553, 1383),
            (1570, 1370), (1574, 1360)], fill=255)
pm = np.asarray(pm.filter(ImageFilter.GaussianBlur(1.5))).astype(float) / 255
wg = np.maximum(wg, pm)
inball = core > 0.5
Ly = np.median(L[inball & (wg < 0.2)]); Lg = np.median(L[inball & (wg > 0.8)])
print('ref luma yellow %.3f green %.3f' % (Ly, Lg))
# yellow panels -> #FFCC29 with the original shading (highlights roll towards white)
sy = (L / Ly)[..., None]; Y = np.array([255, 204, 41]) / 255
sy = np.asarray(Image.fromarray(np.clip(sy[..., 0] * 100, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))).astype(float)[..., None] / 100
yel = np.where(sy <= 1, Y * (0.15 + 0.85 * sy), Y + (1 - Y) * np.clip((sy - 1) * 0.9, 0, 0.55))
# green panels -> near-black with the original shading and a soft specular
sg = (L / Lg)[..., None]
sgs = np.asarray(Image.fromarray(np.clip(sg[..., 0] * 100, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(2))).astype(float)[..., None] / 100
blk = np.clip(0.06 + 0.11 * sgs + 0.18 * np.clip(sgs - 1.2, 0, 1), 0, 1) * np.array([1.0, 1.0, 1.04])
new = yel * (1 - wg[..., None]) + blk * wg[..., None]
out = A * (1 - weight[..., None]) + new * weight[..., None]
img = Image.fromarray((np.clip(out, 0, 1) * 255).round().astype('uint8'))
# SW logo on the big black panel (right side), following the panel's tilt and the sphere's curve, lit by the panel
logo = Image.open('build/sw_logo_white.png').convert('RGBA')
lw = 104; logo = logo.resize((lw, int(lw * logo.height / logo.width)), Image.LANCZOS)
logo = logo.resize((int(logo.width * 0.9), logo.height), Image.LANCZOS).rotate(-18, resample=Image.BICUBIC, expand=True)
cx, cy = 1508, 1192
x0, y0 = cx - logo.width // 2, cy - logo.height // 2
patch = np.asarray(logo).astype(float) / 255
shade = np.clip((L[y0:y0 + logo.height, x0:x0 + logo.width] / Lg), 0.55, 1.15)[..., None]
patch[..., :3] = np.clip(patch[..., :3] * (0.82 + 0.18 * shade), 0, 1) * np.minimum(shade, 1.0) ** 0.5
patch[..., 3] *= core[y0:y0 + logo.height, x0:x0 + logo.width] * 0.92
lg = Image.fromarray((patch * 255).astype('uint8'), 'RGBA')
img = img.convert('RGBA'); img.alpha_composite(lg, (x0, y0)); img = img.convert('RGB')
img.save('src/atleta2_bola_sw.png')
# safety: report any changed pixel outside the ball area (should be none)
diff = np.abs(np.asarray(img).astype(int) - (A * 255).round().astype(int)).sum(2) > 3
outside = diff & ~(band > 0)
print('changed px', int(diff.sum()), 'outside ball band', int(outside.sum()))
cut = img.copy(); cut.putalpha(Image.open('src/mask2.png').convert('L').resize(img.size)); cut.save('build/cut2.png')
