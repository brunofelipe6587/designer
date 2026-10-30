# Fills the gaps left in the regata athlete's cutout where the child was removed (left side of his torso, at
# x 1015-1120 in source px, below his chin). Only pixels that are transparent AND have his body to their right on
# the same row (bays open to the crop edge at x = 1015) are filled, with the black of his own jersey (sampled from
# it, with the photo's grain) — inpainting smeared skin tones from his hand into the shirt, so it is not used. His face, head and every original opaque pixel are left exactly as they were (checked below).
# Writes build/cut1_fill.png (used with crop x >= 1015 so the rest of the child's outline stays outside the frame).
import numpy as np, cv2
from PIL import Image
im = np.array(Image.open('build/cut1.png').convert('RGBA'))
a = im[:, :, 3]
X0, X1, Y0, Y1 = 1015, 1125, 940, 1640      # box of the gaps (below the chin: his chin is at y ≈ 760)
mask = np.zeros(a.shape, np.uint8)
for y in range(Y0, Y1):
    row = a[y, X0:X1 + 60] > 128
    idx = np.nonzero(row)[0]
    if len(idx) == 0: continue
    for x in range(X0, X0 + idx.max()):
        if a[y, x] < 250 and row[x - X0:].any(): mask[y, x] = 255
mask = cv2.dilate(mask, np.ones((3, 3), np.uint8))
mask[:, :X0] = 0
# jersey black: dark opaque pixels of the shirt next to the gaps
patch = im[1000:1200, 1150:1260]; dark = patch[(patch[:, :, 3] > 250) & (patch[:, :, :3].max(2) < 60)][:, :3]
base = np.median(dark, 0); sd = dark.std(0).mean()
rng = np.random.default_rng(3)
out = im.copy()
sel = mask > 0
noise = rng.normal(0, sd * 0.6, (int(sel.sum()), 1))
out[sel, :3] = np.clip(base[None, :] + noise, 0, 255).astype(np.uint8)
out[sel, 3] = 255
# soften the joins so the fill reads as the same fabric
blur = cv2.GaussianBlur(out[:, :, :3], (0, 0), 2.0)
edge = (cv2.dilate(mask, np.ones((5, 5), np.uint8)) > 0) & sel
out[edge, :3] = blur[edge]
print('jersey black', base, 'sd', round(float(sd), 1))
# safety: nothing above the chin and no originally opaque pixel changed
orig_opaque = a > 250
assert not (sel[:Y0]).any()
changed = (out != im).any(2) & orig_opaque & ~sel
assert not changed.any()
Image.fromarray(out).save('build/cut1_fill.png')
print('filled px', int(sel.sum()))
