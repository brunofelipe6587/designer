"""Texto no estilo nativo do Instagram (modo 'fundo'): cada linha com caixa arredondada
que se funde à de cima, centralizado. Cores da marca Guitta Rio."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
DARK = (33, 25, 21)
RED = (190, 8, 17)
WHITE = (255, 255, 255)
FONT = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"


def ig_text(lines, y, size=54, bg=WHITE, alpha=255, pad_x=0.42, pad_y=0.24, radius=0.32):
    """lines: lista de linhas; cada linha é lista de (trecho, cor). Retorna (img, altura)."""
    f = ImageFont.truetype(FONT, size)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    asc, desc = f.getmetrics()
    lh = asc + desc
    px, py, r = int(size * pad_x), int(size * pad_y), int(size * radius)
    widths = [sum(d.textlength(t, font=f) for t, _ in ln) for ln in lines]
    step = lh + 2 * py - int(size * 0.12)  # linhas se encostam/fundem como no app
    for i, (ln, w) in enumerate(zip(lines, widths)):
        x0 = (W - w) / 2 - px
        y0 = y + i * step
        d.rounded_rectangle((x0, y0, x0 + w + 2 * px, y0 + lh + 2 * py), r, fill=bg + (alpha,))
    for i, (ln, w) in enumerate(zip(lines, widths)):
        x = (W - w) / 2
        for t, c in ln:
            d.text((x, y + i * step + py), t, font=f, fill=c)
            x += d.textlength(t, font=f)
    return img, (len(lines) - 1) * step + lh + 2 * py
