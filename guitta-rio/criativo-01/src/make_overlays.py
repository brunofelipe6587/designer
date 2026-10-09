"""Gera as camadas (PNG 1080x1920 transparentes) do criativo 01 Guitta Rio."""
import json
import sys
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(sys.argv[1])
LOGO_SVG = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
DARK = (33, 25, 21)       # #211915 (logo)
RED = (190, 8, 17)        # #BE0811 (raio do logo)
WHITE = (255, 255, 255)
FONT_DIR = "/usr/share/fonts/opentype/inter/"


def font(name, size):
    return ImageFont.truetype(FONT_DIR + name, size)


STYLES = {
    # nome: (fonte, tamanho, cor texto, cor fundo, pad_x, pad_y, tracking)
    "chip": ("InterDisplay-ExtraBold.otf", 36, WHITE, RED, 28, 14, 3),
    "dark": ("InterDisplay-Black.otf", 82, WHITE, DARK, 30, 16, 0),
    "red": ("InterDisplay-Black.otf", 82, WHITE, RED, 30, 16, 0),
    "white": ("InterDisplay-Bold.otf", 40, DARK, WHITE, 26, 16, 0),
    "btn": ("InterDisplay-Black.otf", 54, WHITE, RED, 48, 26, 1),
    "small": ("InterDisplay-SemiBold.otf", 32, WHITE, None, 0, 0, 1),
    "end_head": ("InterDisplay-Black.otf", 96, WHITE, None, 0, 0, 0),
    "end_sub": ("InterDisplay-Bold.otf", 42, DARK, WHITE, 26, 16, 0),
}


def text_size(draw, txt, f, tracking):
    if tracking == 0:
        b = draw.textbbox((0, 0), txt, font=f)
        return b[2] - b[0], b[1], b[3]
    w = sum(draw.textlength(c, font=f) + tracking for c in txt) - tracking
    b = draw.textbbox((0, 0), txt, font=f)
    return int(w), b[1], b[3]


def draw_text(draw, xy, txt, f, fill, tracking):
    x, y = xy
    if tracking == 0:
        draw.text((x, y), txt, font=f, fill=fill)
        return
    for c in txt:
        draw.text((x, y), c, font=f, fill=fill)
        x += draw.textlength(c, font=f) + tracking


def row(txt, style, y, radius=12, shadow=True):
    """Desenha uma linha (pílula) centralizada; retorna (imagem, altura)."""
    fname, size, fg, bg, px, py, tr = STYLES[style]
    f = font(fname, size)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    tw, top, bot = text_size(d, txt, f, tr)
    th = bot - top
    bw, bh = tw + 2 * px, th + 2 * py
    x0 = (W - bw) // 2
    if bg is not None:
        if shadow:
            sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(sh).rounded_rectangle(
                (x0 + 4, y + 8, x0 + bw + 4, y + bh + 8), radius, fill=(0, 0, 0, 90))
            img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(10)))
            d = ImageDraw.Draw(img)
        d.rounded_rectangle((x0, y, x0 + bw, y + bh), radius, fill=bg + (255,))
    else:
        # texto solto: sombra suave para legibilidade
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        draw_text(ImageDraw.Draw(sh), (x0 + px, y + py - top + 3), txt, f, (0, 0, 0, 140), tr)
        img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(6)))
        d = ImageDraw.Draw(img)
    draw_text(d, (x0 + px, y + py - top), txt, f, fg, tr)
    return img, bh


def logo(color_variant, width):
    svg = LOGO_SVG.read_text()
    if color_variant == "white":
        svg = (svg.replace("#211915", "#__TMP__")
                  .replace("fill: #fff;", "fill: #211915;")
                  .replace("#__TMP__", "#ffffff"))
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=width)
    p = OUT / f"_logo_{color_variant}.png"
    p.write_bytes(png)
    return Image.open(p).convert("RGBA")


layers = []  # (arquivo, inicio, fim, slide_px)


def save(img, name, t0, t1, slide=36):
    p = OUT / f"{name}.png"
    img.save(p)
    layers.append({"file": str(p), "t0": t0, "t1": t1, "slide": slide})


def segment(name, rows, t0, t1, y0=None, gap=12, stagger=0.09):
    y = Y0 if y0 is None else y0
    for i, (txt, style) in enumerate(rows):
        img, bh = row(txt, style, y)
        save(img, f"{name}_{i}", round(t0 + i * stagger, 3), t1)
        y += bh + gap


END = 20.17
CARD = 15.3

# Logo fixo no topo (abaixo da UI do Reels)
lg = logo("dark", 230)
base = Image.new("RGBA", (W, H), (0, 0, 0, 0))
px, py, bx, by = 22, 16, 44, 236
sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle(
    (bx + 3, by + 6, bx + lg.width + 2 * px + 3, by + lg.height + 2 * py + 6), 18, fill=(0, 0, 0, 70))
base = Image.alpha_composite(base, sh.filter(ImageFilter.GaussianBlur(8)))
ImageDraw.Draw(base).rounded_rectangle(
    (bx, by, bx + lg.width + 2 * px, by + lg.height + 2 * py), 18, fill=WHITE + (240,))
base.alpha_composite(lg, (bx + px, by + py))
save(base, "logo_top", 0.0, CARD, slide=0)

Y0 = 400

# 1) Gancho de segmentação
segment("s1", [("ATENÇÃO, LOJISTA", "chip"),
               ("VOCÊ TEM LOJA DE", "dark"),
               ("MODA MASCULINA?", "red")], 0.0, 2.1, stagger=0.0)
# 2) Quem é
segment("s2", [("JEANS MASCULINO", "dark"),
               ("NO ATACADO", "red"),
               ("Direto da fábrica  •  Brás/SP desde 1996", "white")], 2.1, 3.6)
# 3) Produto
segment("s3", [("MODELAGENS QUE", "dark"),
               ("GIRAM NA ARARA", "red"),
               ("Slim  •  Reta  •  Skinny  •  Esporte fino", "white")], 3.6, 7.5)
# 4) Grade / plus size
segment("s4", [("GRADE FECHADA", "dark"),
               ("+ PLUS SIZE 48 AO 62", "red"),
               ("Mix pronto pra abastecer sua loja", "white")], 7.5, 11.4)
# 5) Condição comercial
segment("s5", [("PREÇO DE FÁBRICA", "dark"),
               ("PRA SUA MARGEM", "red"),
               ("Pix, boleto ou cartão  •  Envio para todo o Brasil", "white")], 11.4, CARD)

# 6) Cartela final (CTA)
dim = Image.new("RGBA", (W, H), DARK + (200,))
save(dim, "end_dim", CARD, END, slide=0)

card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
lw = logo("white", 520)
card.alpha_composite(lw, ((W - lw.width) // 2, 560))
save(card, "end_logo", CARD + 0.05, END, slide=24)

y = 560 + lw.height + 70
for i, (txt, st) in enumerate([("COMPRE DIRETO", "end_head"), ("NO SITE", "end_head")]):
    img, bh = row(txt, st, y)
    save(img, f"end_h{i}", CARD + 0.15 + 0.08 * i, END)
    y += bh + 22
y += 26
img, bh = row("Cadastre seu CNPJ e veja os preços de atacado", "end_sub", y)
save(img, "end_sub", CARD + 0.35, END)
y += bh + 46
img, bh = row("GUITTARIO.COM.BR", "btn", y, radius=60)
save(img, "end_btn", CARD + 0.5, END)
y += bh + 30
img, bh = row("Venda exclusiva para lojistas com CNPJ", "small", y)
save(img, "end_small", CARD + 0.6, END)

(OUT / "layers.json").write_text(json.dumps(layers, indent=1))
print(len(layers), "camadas")
