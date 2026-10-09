"""Criativo 03 (v2, versão discreta) Guitta Rio — showroom com apresentador. Foco: deixar claro que é ATACADO.
Elementos: gancho "Lojista, aqui é só atacado", faixa-letreiro (ticker) fixa de atacado,
selos de benefício para o lojista e cartela final sobre a vinheta branca do vídeo."""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
DARK = (33, 25, 21)
RED = (190, 8, 17)
WHITE = (255, 255, 255)
GREY = (90, 82, 78)
FD = "/usr/share/fonts/opentype/inter/"

CARD = 27.4          # vinheta branca do vídeo original começa aqui
END = 31.4           # vídeo estendido (congelado) até aqui
TICK_Y, TICK_H = 1268, 78


def font(n, s):
    return ImageFont.truetype(FD + n, s)


def blank(w=W, h=H):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def shadow(img, box, r, a=90, blur=10, off=(4, 8)):
    sh = blank(*img.size)
    ImageDraw.Draw(sh).rounded_rectangle(
        (box[0] + off[0], box[1] + off[1], box[2] + off[0], box[3] + off[1]), r, fill=(0, 0, 0, a))
    return Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(blur)))


def measure(txt, f, tr=0):
    d = ImageDraw.Draw(blank(10, 10))
    b = d.textbbox((0, 0), txt, font=f)
    w = int(sum(d.textlength(c, font=f) + tr for c in txt) - tr) if tr else b[2] - b[0]
    return w, b


def put_text(d, x, y, txt, f, fill, tr=0):
    if not tr:
        d.text((x, y), txt, font=f, fill=fill)
        return
    for c in txt:
        d.text((x, y), c, font=f, fill=fill)
        x += d.textlength(c, font=f) + tr


def pill(txt, fname, size, fg, bg, y, x=None, px=28, py=16, r=12, tr=0, sh=True):
    f = font(fname, size)
    tw, b = measure(txt, f, tr)
    th = b[3] - b[1]
    bw, bh = tw + 2 * px, th + 2 * py
    x = (W - bw) // 2 if x is None else x
    img = blank()
    if bg is not None:
        if sh:
            img = shadow(img, (x, y, x + bw, y + bh), r)
        ImageDraw.Draw(img).rounded_rectangle((x, y, x + bw, y + bh), r, fill=bg + (255,))
    put_text(ImageDraw.Draw(img), x + px - b[0], y + py - b[1], txt, f, fg, tr)
    return img, bh


layers = []


def save(img, name, t0, t1, **kw):
    p = OUT / f"{name}.png"
    img.save(p)
    layers.append({"file": str(p), "t0": round(t0, 3), "t1": round(t1, 3), **kw})


# ---------- 1) HEADLINE discreta, estilo texto nativo do Instagram (0 até a vinheta)
sys.path.insert(0, str(Path(__file__).parent))
from igtext import ig_text  # noqa: E402

HL = [[("Jeans masculino ", DARK), ("no atacado", RED)],
      [("direto da fábrica pra sua loja", DARK)]]
im, _ = ig_text(HL, 1175, size=56)
save(im, "headline", 0.0, CARD, slide=0)

# ---------- 4) CARTELA FINAL sobre a vinheta branca (logo do vídeo fica em ~y 830–1096)
y = 470
im, bh = pill("VENDA SOMENTE NO ATACADO", "InterDisplay-ExtraBold.otf", 40, WHITE, RED, y,
              tr=2, px=26, py=14, sh=False)
save(im, "end_chip", CARD + 0.15, END, slide=24)
y += bh + 26
for i, txt in enumerate(["ABASTEÇA SUA LOJA", "DIRETO DA FÁBRICA"]):
    im, bh = pill(txt, "InterDisplay-Black.otf", 84, DARK, None, y, px=0, py=0)
    save(im, f"end_h{i}", CARD + 0.25 + 0.1 * i, END, slide=24)
    y += bh + 14

y = 1150
im, bh = pill("Cadastre seu CNPJ e compre pelo site", "InterDisplay-Bold.otf", 44, DARK, None,
              y, px=0, py=0)
save(im, "end_sub", CARD + 0.45, END, slide=20)
y += bh + 34
im, bh = pill("GUITTARIO.COM.BR  →", "InterDisplay-Black.otf", 58, WHITE, RED, y, px=50, py=28,
              r=64, tr=1)
save(im, "end_btn", CARD + 0.6, END, slide=30)
y += bh + 28
im, bh = pill("Grade fechada  •  Envio para todo o Brasil", "InterDisplay-SemiBold.otf", 34, GREY,
              None, y, px=0, py=0)
save(im, "end_small", CARD + 0.7, END, slide=0)

(OUT / "layers.json").write_text(json.dumps(layers, indent=1))
print(len(layers), "camadas")
