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

## Criativo 02 "Treino" (V2 do 01, 9:16, 24s, com narração): `out/SandWalk_02_Treino_Narrado_9x16.mp4`

Ajustes pedidos: menos pele e sunga, foco nos kits do site, trilha mais leve e narração.

- **Atleta sempre vestido:** usei só as cenas do treino, com o Brisa de camiseta SW. A estampa da camiseta é a do **Kit VOID**, por isso o Void é o kit principal. A praia aparece uma vez, num plano aberto e distante da bicicleta, só para mostrar que é futevôlei.
- **Narração** (voz neural pt-BR Thalita): "Procurando roupa pra jogar futevôlei? O Brisa treina e joga de Sand Walk. O kit completo tem manga longa, manga curta e shorts, em tecido técnico respirável. De 287 por 189,70, em até 3x sem juros. E na primeira compra, ainda tem 10% OFF com o cupom BEMVINDO10. Garanta o seu no site da Sand Walk." Conferi com transcrição automática se "futevôlei", "Sand Walk" e o cupom são falados direito.
- **Trilha leve:** groove tropical e acústico a 102 BPM, com marimba, shaker e baixo redondo (`music2.py`), sintetizado do zero. Ela abaixa automaticamente quando a narração entra.
- **Grafismos sincronizados com a fala:** as legendas destacam a palavra que está sendo dita; as etiquetas MANGA LONGA, MANGA CURTA e SHORTS aparecem quando são citadas; o preço desce de 287,70 para 189,70 no "por"; o cupom aparece no "cupom".

| Tempo | Cena | Na tela |
|---|---|---|
| 0–2,5s | Bicicleta em plano aberto, depois hang loose de camiseta VOID | ROUPAS DE **FUTEVÔLEI** · KITS COM ATÉ 34% OFF · legenda |
| 2,5–5s | Closes do Brisa com o logo SW no peito | ATLETA SAND WALK · BRISA · legenda |
| 5–10,5s | Kit VOID em destaque | KIT COMPLETO · 3 PEÇAS · etiquetas das peças · TECIDO TÉCNICO RESPIRÁVEL |
| 10,5–16,2s | Carrossel com os 5 kits | ~~R$ 287,70~~ **R$ 189,70** · 3x de R$ 63,23 sem juros |
| 16,2–20,7s | Prancha, perfil e corrida no treino | NA 1ª COMPRA **+10% OFF** · CUPOM: BEMVINDO10 |
| 20,7–24s | Hang loose sorrindo | logo · KIT COMPLETO DE FUTEVÔLEI R$ 189,70 · GARANTA O SEU → · lojasandwalk.com.br |

Para renderizar: `python3 music2.py build/mix2.wav`, depois `PAGE=video2.html DUR=24 node render.js video 30` e, por fim, o mux com ffmpeg. A narração é gerada com `VOICE=pt-BR-ThalitaMultilingualNeural python3 tts.py "<frase>" build/vo/lN.mp3 "+8%"`. O silêncio das pontas é cortado com `silenceremove` a -60 dB, deixando uma folga de 60 ms. Depois disso, rode o script que gera `vo2.js` com os tempos de cada palavra.

### Criativo 02b "Treino" com trilha trap: `out/SandWalk_02b_Treino_Trap_9x16.mp4`

Mesmo vídeo, narração e legendas do 02. Mudou só a trilha: um trap feito do zero (`trap2.py`, 131 BPM em half-time, Fá menor), com kick e 808 com glide, clap no tempo 3, hi-hats com rolls de 1/32, sino FM e pad escuro. A batida segue os cortes do vídeo:
- **Drop na revelação do Kit VOID (5,0s):** riser e prato reverso antes, impacto no corte.
- **A batida para 0,4s antes do preço** e volta com impacto exatamente em 10,5s.
- **Viradas no cupom (16,2s) e no CTA (20,7s)**, com sweeps curtos nos cortes menores e um 808 final em 23,3s.
- A trilha abaixa 10 dB e abre espaço nos médios enquanto a narração fala. O volume final fica em -14,7 LUFS.

Para renderizar: `python3 trap2.py build/mix2_trap.wav` e depois o mux com `out/video2_silent.mp4`.

## Como renderizar (criativo 01)

```
python3 music.py build/music.wav 20          # trilha
node render.js video 30                      # out/video1_silent.mp4
ffmpeg -i out/video1_silent.mp4 -i build/music.wav -c:v copy -c:a aac -b:a 192k -shortest out/SandWalk_01_Bicicleta_9x16.mp4
```

Quadros e máscaras (não versionados) são gerados assim:
- quadros: `ffmpeg -ss <s> -t <d> -i src/brisa.mp4 -vf scale=1080:1920 -start_number <s*30> frames/%05d.jpg`
- slow-mo: `minterpolate=fps=90` a partir de 86,80s, gerando `slow/`
- máscaras: rembg `birefnet-general-lite`, convertidas com `alpha.py`

## Criativo 03 "Benz: chegou o pedido" (9:16, 48s, áudio original): `out/SandWalk_03_Benz_ChegouOPedido_9x16.mp4`

O vídeo orgânico do Benz que já converteu. Ficou intacto, sem cortes, com as cenas e o áudio originais. Por cima entra só uma camada de stickers no estilo dos stickers nativos do Instagram (texto em caixinhas, tag de produto, link), cada um aparecendo na fala certa (`build/benz_words.json`, transcrição com tempo de cada palavra):

| Tempo | Fala / cena | Sticker |
|---|---|---|
| 0–3,4s | "acabou de chegar material novo aqui, os kits da Sand Walk" | CHEGOU O PEDIDO 📦 / KITS DE FUTEVÔLEI SAND WALK (visível já no primeiro quadro) |
| 6,4–12,2s | "esse kit aqui… lançamento" | tag de produto "Kit VOID R$ 189,70" + LANÇAMENTO 🔥 + card do Kit VOID do site |
| 22–26s | "eufórico… ansioso mesmo" | legendas simples (eufórico 😅 / ansioso mesmo 😂) |
| 27,7–34,8s | sacos do pedido chegando | O PEDIDO TÁ CHEGANDO… 📦 → ENVIO PRA TODO O BRASIL 🇧🇷 |
| 37,1–42,4s | "esse também é lançamento" | LANÇAMENTO 🔥 + kit com 3 peças / de R$ 287,70 por R$ 189,70 |
| 42,6s–fim | final | garanta o seu no site 👇 / +10% OFF na 1ª compra: BEMVINDO10 + link sticker LOJASANDWALK.COM.BR |

Para renderizar: `PAGE=benz.html SRC=src/benz.mp4 OUT=out/SandWalk_03_Benz_ChegouOPedido_9x16.mp4 node render_overlay.js video`. O script desenha a camada transparente e a aplica sobre o vídeo original, mantendo o áudio.

## Criativo 04 "Tropa do Bença" (9:16, 16s, música): `out/SandWalk_04_TropaDoBenca_9x16.mp4`

Corte rápido e comercial com as cenas do Benz e a música "Tropa do Bença" (MC Pânico, DJs Marlon Mattos e DJ Martinello). Usa o trecho a partir de 18,2s da faixa: "a tropa do Bença tá em outro patamar" e depois o drop. Os cortes caem na batida (0,428s) e cada batida tem um leve pulso de zoom.

| Tempo | Cena | Na tela |
|---|---|---|
| 0–2,6s | Benz abrindo a jaqueta e close do logo SW | O KIT DO BENÇA 🔥 / KITS DE FUTEVÔLEI SAND WALK + letra em karaokê |
| 2,6s (drop) | Kit VOID em destaque com flash | LANÇAMENTO · KIT VOID · 34% OFF · 3 peças |
| 3,4–8,6s | Benz, pedido chegando, detalhe da manga, 4 kits piscando, colega de camiseta Phoenix | O KIT DO BENÇA · tag Kit PHOENIX R$ 189,70 · ESTAMPA VOID · ESCOLHA SUA ESTAMPA · TÁ EM OUTRO PATAMAR · CHEGOU O PEDIDO 📦 |
| 8,6–12s | Benz com o Kit VOID no canto | KIT COMPLETO 3 PEÇAS · ~~R$ 287,70~~ **R$ 189,70** · 3x sem juros · envio pra todo o Brasil |
| 12–16s | Benz com os dois polegares | +10% OFF NA 1ª COMPRA · CUPOM: BEMVINDO10 · COMPRE NO SITE → · lojasandwalk.com.br |

Para renderizar:
1. Trilha: `ffmpeg -ss 18.2 -t 15.9 -i src/audio/tropa_do_ben.mp3 -af "afade=t=in:d=0.02,afade=t=out:st=15.3:d=0.6,loudnorm=I=-14:TP=-1.5" build/music4.wav`
2. Vídeo: `PAGE=benz2.html DUR=15.9 node render.js video 30`, depois o mux com ffmpeg. Os quadros de `src/benz.mp4` ficam em `frames_benz/` (não versionados).
