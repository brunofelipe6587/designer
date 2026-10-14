# Just Co · Cardigan Pietro — reaquecimento do mais vendido (Meta Ads)

Produto: https://loja.justcostore.com.br/cardigan-pietro-1128526868/p
R$ 299,90 · **R$ 284,90 no PIX** · 3x de R$ 99,97 sem juros · jeans, preto, azul marinho · P ao GG.

## Entregas (`out/`)

| Arquivo | Formato | Ângulo | Destino sugerido |
|---|---|---|---|
| `JustCo_Pietro_9x16_P1_OMaisVendido_narrado.mp4` | 9:16 · 19 s | UGC do criador: "Nº 1 em vendas" + 4 detalhes da PDP + dias amenos | Reels/Stories, público frio e morno |
| `JustCo_Pietro_9x16_P1_OMaisVendido_musica.mp4` | 9:16 · 15 s | mesmo corte, só música (assiste sem som) | Reels/Stories |
| `JustCo_Pietro_9x16_P2_DiasAmenos_narrado.mp4` | 9:16 · 19 s | lookbook de estúdio: estação, como usar, caimento, 3 cores, benefícios | Reels/Stories, remarketing |
| `JustCo_Pietro_9x16_P2_DiasAmenos_musica.mp4` | 9:16 · 15 s | mesmo corte, só música | Reels/Stories |
| `estaticos/JustCo_Pietro_4x5_S1_No1EmVendas.jpg` | 4:5 | prova social + preço | Feed |
| `estaticos/JustCo_Pietro_4x5_S2_DiasAmenos.jpg` | 4:5 | estação + 5 especificações | Feed |
| `estaticos/JustCo_Pietro_4x5_S3_EscolhaASuaCor.jpg` | 4:5 | 3 cores, P ao GG | Feed / remarketing de quem viu o produto |
| `estaticos/JustCo_Pietro_9x16_S4_No1EmVendas_Stories.jpg` | 9:16 | versão stories do S1 (zonas de UI livres) | Stories |

Todos os vídeos fecham num card igual ao card de produto do site (preço PIX, parcelamento, cores, tamanhos, botão
verde "COMPRAR AGORA", cupom THEFIRST e frete grátis a partir de R$ 150 para SP, MG, SC, RS e PR).
Áudio: -14 LUFS; nas versões narradas a música fica ~7 dB abaixo da voz e abaixa mais enquanto ele fala.

## De onde vem cada afirmação
Só o que está na PDP (especificações): gola camisa, fechamento por botões, bolsos frontais com lapela, punhos e barra
canelados, regular fit, toque macio e confortável, excelente respirabilidade, ideal para composições casuais e
elegantes, perfeito para dias amenos. "Nº 1 em vendas / o mais vendido" vem do cliente.

## Pontos para alinhar antes de subir
- **Direito de uso**: o vídeo do P1 é de um criador (Instagram) e a música é da Mizmo — confirmar autorização/licença
  para uso em anúncio pago.
- **Frete**: a PDP ainda mostra "frete grátis acima de R$ 350"; os criativos usam a condição nova (R$ 150 para
  SP, MG, SC, RS e PR). Atualizar o site para não gerar ruído no checkout.
- **Parcelamento**: a barra do site fala em "até 12x", a PDP do Pietro mostra 3x — os criativos usam 3x.
- A cor "preto" aparece esverdeada na foto do site; vale uma foto nova para não frustrar expectativa.

## Como regenerar
```
python3 narrate.py p1 && python3 narrate.py p2                  # voz + audio/timeline_<p>.js
PAGE=p1.html node render_video.js video 30                      # build/p1_narrado_mudo.mp4
NOTL=1 PAGE=p1.html node render_video.js video 30               # build/p1_mudo_15s.mp4
python3 mix_music.py                                            # out/*.mp4 (música em audio/, fora do git)
node render_statics.js                                          # out/estaticos/*.jpg
```
Frames do vídeo do criador: `ffmpeg -i src/insta.mp4 -vf "scale=1080:1920:flags=lanczos,eq=contrast=1.04:saturation=1.06,unsharp" -q:v 2 build/vf/%04d.jpg`.
Recortes (`adobe/` → `assets/`) feitos com Adobe Photoshop API (remove background).
