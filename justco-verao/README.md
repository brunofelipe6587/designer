# JUST CO · Verão 26 — bateria de criativos Meta Ads

Fontes analisadas: vídeo bruto do cliente (16 s, modelo de T-shirt Tricot Horizontal off-white num hangar com
helicóptero R66), categoria [VERÃO do site](https://loja.justcostore.com.br/verao/c) (5 produtos, todos em tricô) e
a Biblioteca de Anúncios da Meta (página "JustCo By MalhariaStar", que está veiculando "Camisetas tricô para o verão" e
"Cardigan Pietro"). O Instagram @just.cooficial bloqueia acesso automatizado (HTTP 429), então a identidade foi
lida do site e da Biblioteca de Anúncios.

## Diagnóstico rápido

- **Posicionamento:** moda masculina premium-acessível (R$ 129,90–189,90), estética minimalista preto/off-white,
  logo em caixa alta condensada. Malharia própria (Malharia Star), então o tricô é o DNA.
- **Público provável:** homem 28–50, classe B, que quer parecer arrumado sem esforço; consciência de produto média
  (sabe o que é tricô, não associa tricô a verão).
- **Ângulos mais fortes:** aspiracional/status (o vídeo do hangar), detalhe/textura (prova técnica do tecido) e
  oferta de primeira compra (cupom THEFIRST).
- **Fatos usados (todos do site):** textura horizontal, gola careca, toque macio, ótimo caimento, acabamento
  premium; cores off white, azul claro e verde; P ao GG (verde: P, G, GG); R$ 139,90 ou 3x de R$ 46,63;
  10% OFF na 1ª compra (THEFIRST); 5% OFF no PIX; até 12x sem juros; frete grátis acima de R$ 350.
  Nenhum benefício foi inventado (ex.: não afirmamos "fresco" ou "respirável", que o site não diz).

## Edição no Adobe (Photoshop API)

- Recorte (remove background) do modelo em 2 frames do vídeo e das fotos de produto nas 3 cores + bermuda
  → `adobe/cut_*.png`. É o que permite o efeito "texto atrás do modelo" (E1/E2), o carrossel de cores e o painel
  de cores do V2.
- Teste de color grade via Adobe: achatou o branco da camiseta, então o grade final foi feito na composição.

## Entregáveis

| Arquivo | Formato | Ângulo / estrutura | Uso |
|---|---|---|---|
| `out/JustCo_Verao_9x16_V1_TshirtEmTrico.mp4` | Reels/Stories 15 s | Gancho de produto que qualifica (produto + público + preço por peça no 1º segundo) | Prospecção |
| `out/JustCo_Verao_9x16_V2_ReparaNaTextura.mp4` | Reels/Stories 15 s | Prova técnica (detalhe) + 3 cores + oferta | Prospecção / RMK |
| `out/estaticos/…E1_VeraoTextoAtras.png` | Feed 4:5 | DNA do produto (efeito texto atrás) | Prospecção |
| `out/estaticos/…E2_VeraoStories.png` | Stories 9:16 | Mesmo conceito do E1 | Prospecção |
| `out/estaticos/…E3_NaoESobreOHelicoptero.png` | Feed 4:5 | Curiosidade / aspiracional | Prospecção |
| `out/estaticos/…E4_1Peca3Cores.png` | Feed 4:5 | Variedade (3 cores) | Prospecção |
| `out/estaticos/…E5_PrimeiraCompra10OFF.png` | Feed 4:5 | Oferta (reciprocidade) | Fundo de funil |
| `out/estaticos/…E6_RMK_ReparaNaTextura.png` | Feed 4:5 | Prova técnica — objeção "qualidade" | Remarketing |
| `out/estaticos/…E7_LookTricoCompleto.png` | Feed 4:5 | Look completo + frete grátis (ticket médio) | RMK / compradores |
| `out/estaticos/…Carrossel_1x1_01…05.png` | Carrossel 1:1 | Hook → 3 cores → cupom | Prospecção |

Os vídeos saem **sem áudio** (o bruto não tem som). Ao subir no Gerenciador, use "Adicionar música" da biblioteca
licenciada da Meta; o roteiro funciona no mudo (todo o texto está na tela).

### Documentos editáveis no Adobe Express

- Feed 4:5 (6 páginas): https://new.express.adobe.com/id/urn:aaid:sc:US:6aa3961b-99e5-4a08-af48-4ed053584e02
- Stories 9:16: https://new.express.adobe.com/id/urn:aaid:sc:US:3723adec-fb65-4ac4-84ce-60a0ffc79e3f
- Carrossel 1:1 (5 cards): https://new.express.adobe.com/id/urn:aaid:sc:US:097463d0-2603-48b1-a93c-4dbe42b813ee

No Express as fontes são as equivalentes do Adobe Fonts disponíveis no plano (League Gothic no lugar da Bebas Neue,
Montserrat no lugar da Inter, Playfair Display igual). Os PNGs em `out/estaticos` são a versão final de referência.

## Copy para o Gerenciador de Anúncios

**V1 · T-shirt em tricô pra homem que se veste bem**
- Gancho (frame 0, já é a miniatura): "MODA MASCULINA · VERÃO 26 / T-SHIRT EM TRICÔ / PRA HOMEM QUE SE VESTE BEM /
  R$ 139,90 · CADA PEÇA". Produto, público e preço unitário antes do primeiro corte, para filtrar o clique e mandar
  sessão qualificada. O preço aparece sempre como "cada peça" e o parcelamento por extenso ("parcele em 3 vezes de
  R$ 46,63"), para ninguém entender "3 peças pelo valor". Sem menção ao local da gravação.
- Texto principal: T-shirt masculina em tricô com textura horizontal, gola careca, toque macio e caimento premium.
  R$ 139,90 cada peça, ou parcele em 3 vezes de R$ 46,63 sem juros. Do P ao GG.
- Título: T-shirt em tricô · R$ 139,90 a peça
- Descrição: 10% OFF na 1ª compra · cupom THEFIRST
- CTA: Comprar agora

**V2 · Repara na textura**
- Texto principal: Repara na textura. Tricô com textura horizontal, gola careca e acabamento premium, em off white,
  azul claro e verde. Do P ao GG.
- Título: 1 peça. 3 cores.
- Descrição: Primeira compra com 10% OFF · THEFIRST
- CTA: Comprar agora

**E1/E2 · Verão (texto atrás)**
- Texto principal: Coleção Verão 26 da JUST CO. T-shirt MC Tricot Horizontal: toque macio, caimento premium.
- Título: T-shirt Tricot Horizontal · R$ 139,90
- CTA: Comprar agora

**E3 · Não é sobre o helicóptero (estático)**
- Texto principal: Não é sobre o helicóptero. É sobre como você chega. Tricô JUST CO para o verão.
- Título: Ver a peça
- CTA: Saiba mais

**E4 · 1 peça, 3 cores**
- Texto principal: Off white, azul claro ou verde. A mesma T-shirt Tricot Horizontal em 3 cores, do P ao GG.
- Título: Escolha a sua cor
- CTA: Comprar agora

**E5 · Primeira compra**
- Texto principal: Sua primeira JUST CO sai com 10% OFF no cupom THEFIRST. E ainda tem 5% OFF no PIX e
  frete grátis acima de R$ 350.
- Título: 10% OFF · cupom THEFIRST
- CTA: Comprar agora

**E6 · Remarketing: repara na textura**
- Texto principal: Ainda pensando nela? Olha de perto: tricô com textura horizontal, gola careca, toque macio
  e acabamento premium. Do P ao GG.
- Título: Ver de perto
- CTA: Comprar agora

**E7 · Look tricô completo**
- Texto principal: O look do verão é todo em tricô. Bermuda Tricot R$ 189,90 + t-shirts tricô a partir de
  R$ 129,90. Monte o conjunto e ganhe frete grátis acima de R$ 350.
- Título: Monte seu look
- CTA: Comprar agora

**Carrossel**
- Texto principal: Tricô no verão? Assim. Arraste para ver as 3 cores da T-shirt Tricot Horizontal.
- Títulos dos cards: 01 Tricô no verão · 02 Off white · 03 Azul claro · 04 Verde · 05 10% OFF na 1ª compra

## Sugestão de teste

1. **Prospecção (ABO, público aberto, homens 25–55):** V1, V2, E1, E3, E4 e carrossel, 1 anúncio por conjunto
   ou todos no mesmo conjunto com orçamento igual por 7 dias. Métricas de corte: hook rate > 25% nos vídeos,
   CTR > 1% nos estáticos.
2. **Remarketing (visitou 14 dias / adicionou ao carrinho):** E6, E5, E7 e V2.
3. Escalar o vencedor com variações de hook.

## Como regenerar

```
python3 build_express.py                       # HTML autocontido para importar no Adobe Express
node render_statics.js [e1 …]                  # PNGs em out/estaticos
PAGE=v1.html node render_video.js video 30     # vídeos (precisa de build/vf: ver abaixo)
ffmpeg -i src/bruto.mp4 -vf "scale=1080:1920:flags=lanczos,eq=contrast=1.06:saturation=1.12:gamma=1.02,unsharp=5:5:0.6" -q:v 3 build/vf/%04d.jpg
```
