# Vetoriza o logo azul: separa as formas brancas e ciano do PNG, contorna com potrace e monta um SVG.
# Uso: python3 -I vetorizar.py ../assets/logo_fabricio_azul.png ../assets/logo_fabricio_azul.svg
import re, subprocess, sys, tempfile, os
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert('RGBA')).astype(float) / 255
r, g, b, a = (im[..., i] for i in range(4))
lum = (r + g + b) / 3
sat = im[..., :3].max(2) - im[..., :3].min(2)
camadas = {
    'branco': a * np.clip((lum - .55) / .2, 0, 1) * np.clip((.35 - sat) / .15, 0, 1),
    'ciano': a * np.clip((b - .6) / .2, 0, 1) * np.clip((sat - .35) / .15, 0, 1) * np.clip((g - .45) / .15, 0, 1),
}
H, W = a.shape
F = 4                                     # traça em 4x para curvas mais lisas
m = (a > .98) & (b > .78) & (r < .31) & (g > .55)
ciano = '#%02x%02x%02x' % tuple(int(np.median(c[m]) * 255) for c in (r, g, b))

grupos = {}
with tempfile.TemporaryDirectory() as tmp:
    for nome, mask in camadas.items():
        img = Image.fromarray((mask * 255).astype(np.uint8)).resize((W * F, H * F), Image.BICUBIC).filter(ImageFilter.GaussianBlur(F * .6))
        pbm, svg = os.path.join(tmp, nome + '.pbm'), os.path.join(tmp, nome + '.svg')
        img.point(lambda v: 0 if v > 127 else 255).convert('1').save(pbm)
        subprocess.run(['potrace', '-s', '-t', '40', '-a', '1.1', '-O', '0.4', '--flat', '-o', svg, pbm], check=True)
        g_ = re.search(r'(<g transform="[^"]+")[^>]*>(.*?)</g>', open(svg).read(), re.S)
        grupos[nome] = (g_.group(1), g_.group(2))

VW, VH, M = W * F, H * F, 40
(tb, pb), (tc, pc) = grupos['branco'], grupos['ciano']
open(dst, 'w').write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-M} {-M} {VW + 2 * M} {VH + 2 * M}" width="{VW + 2 * M}" height="{VH + 2 * M}">
<defs>
 <linearGradient id="bc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe8f3"/></linearGradient>
 <filter id="sh" x="-5%" y="-10%" width="110%" height="130%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#00104a" flood-opacity=".55"/></filter>
</defs>
<g filter="url(#sh)">
 {tc} fill="{ciano}" stroke="none">{pc}</g>
 {tb} fill="url(#bc)" stroke="none">{pb}</g>
</g>
</svg>
''')
print(dst, VW + 2 * M, VH + 2 * M, ciano)
