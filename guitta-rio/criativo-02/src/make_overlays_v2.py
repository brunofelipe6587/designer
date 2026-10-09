"""Criativo 02 Guitta Rio — conceito "Seu cliente vai pedir" + 3 motivos + passo a passo.
Layout editorial alinhado à esquerda (diferente do 01, centralizado)."""
import json
import sys
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(sys.argv[1])
LOGO_SVG = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
DARK = (33, 25, 21)       # #211915
RED = (190, 8, 17)        # #BE0811
WHITE = (255, 255, 255)
FD = "/usr/share/fonts/opentype/inter/"
X0 = 64                    # margem esquerda
END = 17.9
CARD = 13.6


def font(name, size):
    return ImageFont.truetype(FD + name, size)


def blank():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def shadow_box(img, box, radius, alpha=90, blur=10, off=(4, 8)):
    sh = blank()
    x0, y0, x1, y1 = box
    ImageDraw.Draw(sh).rounded_rectangle(
        (x0 + off[0], y0 + off[1], x1 + off[0], y1 + off[1]), radius, fill=(0, 0, 0, alpha))
    return Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(blur)))


def pill(txt, fname, size, fg, bg, y, x=X0, px=26, py=16, radius=10, tracking=0,
         outline=None):
    """Caixa com texto alinhada à esquerda em x. Retorna (img, largura, altura)."""
    f = font(fname, size)
    img = blank()
    d = ImageDraw.Draw(img)
    b = d.textbbox((0, 0), txt, font=f)
    if tracking:
        tw = int(sum(d.textlength(c, font=f) + tracking for c in txt) - tracking)
    else:
        tw = b[2] - b[0]
    th = b[3] - b[1]
    bw, bh = tw + 2 * px, th + 2 * py
    box = (x, y, x + bw, y + bh)
    if bg is not None:
        img = shadow_box(img, box, radius)
        d = ImageDraw.Draw(img)
        d.rounded_rectangle(box, radius, fill=bg + (255,),
                            outline=outline, width=4 if outline else 0)
    tx, ty = x + px - b[0], y + py - b[1]
    if bg is None:  # sombra no texto solto
        sh = blank()
        ImageDraw.Draw(sh).text((tx, ty + 3), txt, font=f, fill=(0, 0, 0, 150))
        img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(6)))
        d = ImageDraw.Draw(img)
    if tracking:
        cx = tx
        for c in txt:
            d.text((cx, ty), c, font=f, fill=fg)
            cx += d.textlength(c, font=f) + tracking
    else:
        d.text((tx, ty), txt, font=f, fill=fg)
    return img, bw, bh


def badge(num, y, x=X0, d=118, fill=RED):
    """Círculo numerado (01, 02, 03) com aro branco."""
    img = blank()
    img = shadow_box(img, (x, y, x + d, y + d), d // 2, alpha=110)
    dr = ImageDraw.Draw(img)
    dr.ellipse((x, y, x + d, y + d), fill=WHITE)
    dr.ellipse((x + 6, y + 6, x + d - 6, y + d - 6), fill=fill)
    f = font("InterDisplay-Black.otf", int(d * 0.42))
    b = dr.textbbox((0, 0), num, font=f)
    dr.text((x + (d - (b[2] - b[0])) / 2 - b[0], y + (d - (b[3] - b[1])) / 2 - b[1]),
            num, font=f, fill=WHITE)
    return img


def logo(variant, width):
    svg = LOGO_SVG.read_text()
    if variant == "white":
        svg = (svg.replace("#211915", "#__T__").replace("fill: #fff;", "fill: #211915;")
                  .replace("#__T__", "#ffffff"))
    p = OUT / f"_logo_{variant}.png"
    p.write_bytes(cairosvg.svg2png(bytestring=svg.encode(), output_width=width))
    return Image.open(p).convert("RGBA")


layers = []


def save(img, name, t0, t1, slide=36, dx=0):
    p = OUT / f"{name}.png"
    img.save(p)
    layers.append({"file": str(p), "t0": round(t0, 3), "t1": round(t1, 3),
                   "slide": slide, "dx": dx})


# Logo fixo (pílula branca, canto superior direito — no 01 ficava à esquerda)
lg = logo("dark", 220)
img = blank()
px, py = 20, 14
bw, bh = lg.width + 2 * px, lg.height + 2 * py
bx, by = W - 44 - bw, 236
img = shadow_box(img, (bx, by, bx + bw, by + bh), 16, alpha=70, blur=8)
ImageDraw.Draw(img).rounded_rectangle((bx, by, bx + bw, by + bh), 16, fill=WHITE + (242,))
img.alpha_composite(lg, (bx + px, by + py))
save(img, "logo", 0, CARD, slide=0)

# ---------- 1) GANCHO (palavra por palavra, 0–2.4s)
HOOK_END = 2.4
y = 390
im, w_, h_ = pill("PARA LOJISTAS DE MODA MASCULINA", "InterDisplay-ExtraBold.otf", 44,
                  DARK, WHITE, y, tracking=2, px=24, py=15)
save(im, "h_chip", 0.0, HOOK_END, slide=0, dx=-40)
y += h_ + 18
for i, (txt, bg) in enumerate([("SEU CLIENTE", DARK), ("VAI PEDIR", DARK), ("ESSE JEANS.", RED)]):
    im, w_, h_ = pill(txt, "InterDisplay-Black.otf", 112, WHITE, bg, y, px=30, py=20,
                      outline=WHITE if bg == RED else None)
    save(im, f"h_{i}", 0.0 if i == 0 else 0.3 * i, HOOK_END, slide=0, dx=-60)
    y += h_ + 12

# ---------- 2) PONTE (2.4–4.4s)
y = 420
im, w_, h_ = pill("3 MOTIVOS PRA TER", "InterDisplay-Black.otf", 84, WHITE, DARK, y)
save(im, "p_0", HOOK_END, 4.4, dx=-50, slide=0)
y += h_ + 12
im, w_, h_ = pill("ELE NA SUA ARARA ↓", "InterDisplay-Black.otf", 84, WHITE, RED, y,
                  outline=WHITE)
save(im, "p_1", HOOK_END + 0.12, 4.4, dx=-50, slide=0)

# ---------- 3) MOTIVOS (badge + título + apoio)
MOTIVOS = [
    ("01", "LAVAGEM ESCURA", "Coringa: combina com tudo e", "vende o ano inteiro", 4.4, 7.4),
    ("02", "GRADE COMPLETA", "Do tradicional ao plus size 62:", "atende todo cliente", 7.4, 10.4),
    ("03", "DIRETO DA FÁBRICA", "Brás/SP desde 1996 •", "envio para todo o Brasil", 10.4, CARD),
]
for num, title, s1, s2, t0, t1 in MOTIVOS:
    y = 410
    save(badge(num, y), f"m{num}_b", t0, t1, slide=0, dx=-40)
    xt = X0 + 118 + 18
    im, w_, h_ = pill(title, "InterDisplay-Black.otf", 76, WHITE, DARK, y + 8, x=xt)
    save(im, f"m{num}_t", t0 + 0.1, t1, slide=0, dx=-50)
    y2 = y + 8 + h_ + 12
    for j, s in enumerate([s1, s2]):
        im, w_, h_ = pill(s, "InterDisplay-Bold.otf", 42, DARK, WHITE, y2, x=xt, py=12)
        save(im, f"m{num}_s{j}", t0 + 0.2 + 0.08 * j, t1, slide=0, dx=-40)
        y2 += h_ + 8

# ---------- 4) CARTELA FINAL: passo a passo
dim = Image.new("RGBA", (W, H), DARK + (205,))
save(dim, "end_dim", CARD, END, slide=0)

lw = logo("white", 420)
img = blank()
img.alpha_composite(lw, (X0, 470))
save(img, "end_logo", CARD + 0.05, END, slide=20)

y = 470 + lw.height + 60
im, w_, h_ = pill("COMO COMPRAR", "InterDisplay-Black.otf", 96, WHITE, None, y, px=0, py=0)
save(im, "end_title", CARD + 0.12, END, slide=0, dx=-50)
y += h_ + 44
STEPS = ["Cadastre seu CNPJ no site", "Veja os preços de atacado", "Monte sua grade e receba"]
for i, s in enumerate(STEPS):
    t = CARD + 0.3 + 0.18 * i
    save(badge(str(i + 1), y, d=88), f"end_s{i}_b", t, END, slide=0, dx=-40)
    im, w_, h_ = pill(s, "InterDisplay-Bold.otf", 48, WHITE, None, y + 14, x=X0 + 88 + 26,
                      px=0, py=0)
    save(im, f"end_s{i}_t", t + 0.05, END, slide=0, dx=-40)
    y += 88 + 30
y += 30
im, w_, h_ = pill("GUITTARIO.COM.BR  →", "InterDisplay-Black.otf", 56, WHITE, RED, y,
                  px=46, py=26, radius=60, tracking=1, outline=WHITE)
save(im, "end_btn", CARD + 0.95, END, slide=30)
y += h_ + 26
im, w_, h_ = pill("Venda exclusiva no atacado para lojistas com CNPJ", "InterDisplay-SemiBold.otf",
                  32, WHITE, None, y, px=0, py=0)
save(im, "end_small", CARD + 1.05, END, slide=0)

(OUT / "layers.json").write_text(json.dumps(layers, indent=1))
print(len(layers), "camadas")
