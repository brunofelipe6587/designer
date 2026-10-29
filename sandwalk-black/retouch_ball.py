# Removes the third-party brand figure printed on the ball in src/atleta2.jpg (blue player, right side of the ball)
# with OpenCV inpainting limited to that figure's pixels. Nothing else in the photo changes — the athlete is untouched.
# Writes src/atleta2_bola_sem_marca.jpg (lossless PNG too) and rebuilds build/cut2.png from it with the same mask.
import cv2, numpy as np
from PIL import Image
im = cv2.imread('src/atleta2.jpg')
x0, y0, x1, y1 = 1572, 1050, 1645, 1160                      # tight box around the printed figure (and its ball)
roi = im[y0:y1, x0:x1].astype(int); b, g, r = roi[..., 0], roi[..., 1], roi[..., 2]
yellow = (r > 165) & (g > 150) & (b < 140)                     # the ball's own colours inside the box
green = (g > r + 35) & (g > b + 35)
yy, xx = np.mgrid[y0:y1, x0:x1]
inside = (xx - 1410) ** 2 + (yy - 1197) ** 2 < 229 ** 2         # stay inside the ball's outline (centre/radius measured)
logo = ~(yellow | green) & inside                              # the navy ink and its soft edge
logo = logo.astype(np.uint8) * 255
mask = np.zeros(im.shape[:2], np.uint8); mask[y0:y1, x0:x1] = logo
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
out = cv2.inpaint(im, mask, 5, cv2.INPAINT_NS)
changed = (np.abs(out.astype(int) - im.astype(int)).sum(2) > 0)
ys, xs = np.nonzero(changed); print('changed px', changed.sum(), 'bbox', xs.min(), xs.max(), ys.min(), ys.max())
cv2.imwrite('src/atleta2_bola_sem_marca.png', out)
cv2.imwrite('build/ball_mask.png', mask)
rgb = Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))
m = Image.open('src/mask2.png').convert('L').resize(rgb.size)
rgb.putalpha(m); rgb.save('build/cut2.png')
