# Sand Walk: criativos de performance

Insumos: vídeo "Vlog do Brisa Ep1" (`src/brisa.mp4`), produtos e logo da home (`lojasandwalk.com.br`).
Identidade: preto, branco e amarelo SW `#FFCC29`; títulos em Syne 800 e textos em Inter, as fontes do site.

## Criativo 01 "Bicicleta" (9:16, 20s): `out/SandWalk_01_Bicicleta_9x16.mp4`

Objetivo: gerar sessão qualificada para a home. Quem clica já sabe que vai ver roupa de futevôlei, quanto custa e qual é a oferta.

| Tempo | Cena | Texto na tela |
|---|---|---|
| 0–3s | Bicicleta do Brisa em slow-motion com interpolação de quadros. O título fica atrás do atleta (recorte por IA): a perna e a bola passam na frente do texto | ROUPAS DE **FUTEVÔLEI** · com o atleta BRISA · KITS COM ATÉ 34% OFF |
| 3–8s | Montagem de lances cortada na batida: domínio no peito, ataque, salto, rede, close da sunga | FEITA PRA AREIA · TECIDO RESPIRÁVEL · LEVE NO JOGO · PERFORMANCE DE ATLETA · logo + VISTA O JOGO |
| 8–14s | Carrossel 3D dos 5 kits (Phoenix, Ever Flame, Void, Shadow, Pure Blood), avançando na batida | KITS COMPLETOS · manga longa + manga curta + shorts · ~~R$ 287,70~~ **R$ 189,70** · 3x de R$ 63,23 sem juros |
| 14–16s | Close da sunga + 4 sungas do site | ~~R$ 99,90~~ **R$ 69,90** · 30% OFF |
| 16–20s | Brisa sorrindo e fazendo hang loose + oferta e CTA | 10% OFF NA 1ª COMPRA · CUPOM BEMVINDO10 · 3x sem juros • 5% OFF no Pix · COMPRE NO SITE → lojasandwalk.com.br |

- Todo texto importante fica entre y 285 e 1635, a área que continua visível quando o Meta corta o 9:16 para 4:5 no feed.
- Trilha original sintetizada do zero (`music.py`): sem direitos autorais, segura para anúncio. 120 BPM, com impacto no toque da bola e drop no início da montagem.
- Preços e cupom foram tirados da home em 09/10/2026. Confirmar antes de subir.

## Como renderizar

```
python3 music.py build/music.wav 20          # trilha
node render.js video 30                      # out/video1_silent.mp4
ffmpeg -i out/video1_silent.mp4 -i build/music.wav -c:v copy -c:a aac -b:a 192k -shortest out/SandWalk_01_Bicicleta_9x16.mp4
```

Quadros e máscaras (não versionados) são gerados assim:
- quadros: `ffmpeg -ss <s> -t <d> -i src/brisa.mp4 -vf scale=1080:1920 -start_number <s*30> frames/%05d.jpg`
- slow-mo: `minterpolate=fps=90` a partir de 86,80s, gerando `slow/`
- máscaras: rembg `birefnet-general-lite`, convertidas com `alpha.py`
