#!/usr/bin/env bash
# Kit Feminino Blackout: cut the store image (white background) out to build/kit_cut.png and make the stickers.
# The plays are the same women's futevôlei clips as the Void creatives (../sandwalk-voidfem/prep_vf1.sh makes them).
set -euo pipefail
cd "$(dirname "$0")"
[ -d ../sandwalk-voidfem/frames/h1 ] || ../sandwalk-voidfem/prep_vf1.sh
python3 - <<'PY'
from PIL import Image, ImageFilter
import numpy as np
im = Image.open('src/kit_frente.jpg').convert('RGB'); a = np.asarray(im).astype(float)
alpha = np.clip((248 - a.min(2)) / 18, 0, 1)
al = Image.fromarray((alpha * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
out = im.copy(); out.putalpha(al); out.save('build/kit_cut.png')
PY
python3 make_stickers.py
