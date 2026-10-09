# Turn birefnet grayscale masks into white RGBA images with the mask as alpha (for canvas 'destination-in').
import sys, glob
from PIL import Image
for d in sys.argv[1:]:
    for f in glob.glob(f'{d}/*.png'):
        im = Image.open(f)
        if im.mode == 'RGBA': continue
        a = im.convert('L')
        out = Image.new('RGBA', a.size, (255, 255, 255, 0)); out.putalpha(a)
        out.save(f)
