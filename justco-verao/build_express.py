# Builds self-contained HTML documents (fonts + images as data URIs) from statics.html for the Adobe Express
# importer: one document per canvas size. Usage: python3 build_express.py -> build/express_<fmt>.html
import base64, io, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
DOCS = {
    '4x5': (['e1', 'e3', 'e4', 'e5', 'e6', 'e7'], 1080, 1350),
    '9x16': (['e2'], 1080, 1920),
    'carrossel_1x1': (['c1', 'c2', 'c3', 'c4', 'c5'], 1080, 1080),
}
MAX_SIDE = 1500
_cache = {}


def data_uri(rel):
    if rel in _cache:
        return _cache[rel]
    p = ROOT / rel
    if p.suffix == '.svg':
        uri = 'data:image/svg+xml;base64,' + base64.b64encode(p.read_bytes()).decode()
    elif p.suffix == '.woff2':
        uri = 'data:font/woff2;base64,' + base64.b64encode(p.read_bytes()).decode()
    else:
        im = Image.open(p)
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        buf = io.BytesIO()
        if im.mode == 'RGBA':
            im.save(buf, 'PNG', optimize=True); mime = 'image/png'
        else:
            im.convert('RGB').save(buf, 'JPEG', quality=88); mime = 'image/jpeg'
        uri = f'data:{mime};base64,' + base64.b64encode(buf.getvalue()).decode()
    _cache[rel] = uri
    return uri


def main():
    src = (ROOT / 'statics.html').read_text()
    style = re.search(r'<style>(.*?)</style>', src, re.S).group(1)
    # page chrome for the review sheet is not part of the design
    style = style.replace('html, body { margin: 0; background: #888; }', 'html, body { margin: 0; background: #fff; }')
    style = style.replace('body { display: flex; flex-wrap: wrap; gap: 40px; padding: 40px; }', 'body { display: block; }')
    # Express maps text to Adobe Fonts only: swap to the closest entitled faces (kit idt4reg) —
    # League Gothic for Bebas Neue, Montserrat for Inter, Playfair Display stays.
    # (the importer reads the first declaration of a custom property, so the values are replaced in place)
    for a, b in (("--display: 'Bebas Neue', sans-serif", "--display: 'league-gothic', sans-serif"),
                 ("--sans: 'Inter', sans-serif", "--sans: 'montserrat', sans-serif"),
                 ("--serif: 'Playfair Display', serif", "--serif: 'playfair-display', serif")):
        assert a in style, a
        style = style.replace(a, b)
    # Montserrat runs wider than Inter: tighten the E6 checklist so it clears the button
    style = re.sub(r' em \{', ' .hl {', style)
    fonts = "#e6 ul { margin-top: 290px; font-size: 23px; } #e6 li { padding: 12px 0; }"
    sections = dict(re.findall(r'(<section class="slide[^"]*" id="(\w+)">.*?</section>)', src, re.S)[i][::-1]
                    for i in range(len(re.findall(r'<section class="slide', src))))
    for name, (ids, w, h) in DOCS.items():
        body = []
        for i in ids:
            sec = sections[i]
            sec = re.sub(r'src="(assets/[^"]+)"', lambda m: f'src="{data_uri(m.group(1))}"', sec)
            # the importer styles <em> as italic regardless of CSS; the highlight words are upright spans
            sec = re.sub(r'<em>(.*?)</em>', r'<span class="hl">\1</span>', sec)
            sec = sec.replace(' grain"', '"').replace(f'id="{i}">', f'id="{i}" data-canvas-width="{w}" data-canvas-height="{h}">', 1)
            body.append(sec)
        html = (f'<!doctype html>\n<html lang="pt-br">\n<head>\n<meta charset="utf-8">\n'
                f'<meta name="hz:slide-selector" content=".slide">\n'
                f'<meta name="hz:canvas-width" content="{w}">\n<meta name="hz:canvas-height" content="{h}">\n'
                f'<title>Just Co Verão {name}</title>\n<link rel="stylesheet" href="https://use.typekit.net/idt4reg.css">\n<style>\n{style}\n{fonts}\n</style>\n</head>\n<body>\n'
                + '\n'.join(body) + '\n</body>\n</html>\n')
        out = ROOT / 'build' / f'express_{name}.html'
        out.write_text(html)
        print(out.relative_to(ROOT), f'{len(html) / 1e6:.1f} MB', len(ids), 'pages')


if __name__ == '__main__':
    sys.exit(main())
