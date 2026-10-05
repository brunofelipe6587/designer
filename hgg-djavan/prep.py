# Regenerates the 2x Lanczos-resampled product layers used by video.html / videoB.html
# (pure resampling: no detail is added or changed).
from PIL import Image
import os
d = os.path.join(os.path.dirname(__file__), 'build')
for n in ['frente', 'modelo_frente', 'modelo_costas', 'costas']:
    Image.open(f'{d}/{n}.png').resize((2400, 3200), Image.LANCZOS).save(f'{d}/{n}_2x.png')
