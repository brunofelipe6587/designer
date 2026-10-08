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
  → `adobe/cut_*.png`. É o que permite o efeito "texto atrás do modelo" (E1/E2), o carrossel de cores e o card
  de produto do final do V2.
- Teste de color grade via Adobe: achatou o branco da camiseta, então o grade final foi feito na composição.

## Entregáveis

| Arquivo | Formato | Ângulo / estrutura | Uso |
|---|---|---|---|
| `out/JustCo_Verao_9x16_V1_TshirtEmTrico_narrado.mp4` | Reels/Stories ~20 s, narração + música | Gancho de produto que qualifica (produto + público + preço por peça no 1º segundo) | Prospecção |
| `out/JustCo_Verao_9x16_V1_TshirtEmTrico_musica.mp4` | Reels/Stories 15 s, só música | Mesmo roteiro, sem narração | Prospecção |
| `out/JustCo_Verao_9x16_V2_PrimeiraCompra_narrado.mp4` | Reels/Stories ~20 s, narração + música | Oferta de 1ª compra com preço final no gancho + passo a passo até o checkout | Prospecção (novos clientes) / RMK |
| `out/JustCo_Verao_9x16_V2_PrimeiraCompra_musica.mp4` | Reels/Stories 15 s, só música | Mesmo roteiro, sem narração | Prospecção (novos clientes) / RMK |
| `out/JustCo_Verao_9x16_V3_Categoria_Vitrine_narrado.mp4` | Reels/Stories ~21 s, narração + música | **Categoria** · vitrine das 5 peças com preço por peça, "a partir de R$ 129,90" | Tráfego para /verao/c |
| `out/JustCo_Verao_9x16_V3_Categoria_Vitrine_musica.mp4` | Reels/Stories 15 s, só música | Mesmo roteiro, sem narração | Tráfego para /verao/c |
| `out/JustCo_Verao_9x16_V4_Categoria_MonteSeuLook_narrado.mp4` | Reels/Stories ~18 s, narração + música | **Categoria** · monte o look (camiseta + bermuda) e passe de R$ 350 com frete grátis | Tráfego para /verao/c |
| `out/JustCo_Verao_9x16_V4_Categoria_MonteSeuLook_musica.mp4` | Reels/Stories 15 s, só música | Mesmo roteiro, sem narração | Tráfego para /verao/c |
| `out/estaticos/…E1_VeraoTextoAtras.png` | Feed 4:5 | DNA do produto (efeito texto atrás) | Prospecção |
| `out/estaticos/…E2_VeraoStories.png` | Stories 9:16 | Mesmo conceito do E1 | Prospecção |
| `out/estaticos/…E3_NaoESobreOHelicoptero.png` | Feed 4:5 | Curiosidade / aspiracional | Prospecção |
| `out/estaticos/…E4_1Peca3Cores.png` | Feed 4:5 | Variedade (3 cores) | Prospecção |
| `out/estaticos/…E5_PrimeiraCompra10OFF.png` | Feed 4:5 | Oferta (reciprocidade) | Fundo de funil |
| `out/estaticos/…E6_RMK_ReparaNaTextura.png` | Feed 4:5 | Prova técnica — objeção "qualidade" | Remarketing |
| `out/estaticos/…E7_LookTricoCompleto.png` | Feed 4:5 | Look completo + frete grátis (ticket médio) | RMK / compradores |
| `out/estaticos/…Carrossel_1x1_01…05.png` | Carrossel 1:1 | Hook → 3 cores → cupom | Prospecção |

Os vídeos V1 e V2 têm **narração masculina** (pt-BR, voz Antonio com ritmo e tom ajustados para uma leitura mais
grave e elegante; tratamento de voz com graves quentes, compressão leve e ambiência sutil, −16 LUFS). Cada bloco
visual foi re-temporizado para a fala dele, então a frase troca junto com a transição da tela (`narrate.py` gera a
voz e `audio/timeline_v*.js`). A marca não é falada (nenhuma grafia de "Just Co" soou natural na voz sintética); o
logo aparece em tela.

**Música:** Mizmo – "Hello, The Sun Is Up, Where Are You?" (arquivo enviado pelo cliente; `mix_music.py`, o mp3 fica
fora do git). Nas versões só com música entra o trecho mais cheio da faixa (a partir de 63,75 s, início de seção),
a −14 LUFS. Nas narradas entra o trecho mais leve (a partir de 0,5 s), ~14 dB abaixo da voz e com ducking automático
(sidechain) enquanto a voz fala; mix final a −14 LUFS. Conferido por transcrição: todas as falas continuam
inteligíveis com a música. Atenção a direitos: se a faixa não for licenciada para publicidade, a Meta pode silenciar
ou reprovar o anúncio.

Roteiro da narração:
- **V1 (~20 s):** "Camiseta de tricô, pra homem que se veste bem." · "Toque macio, caimento premium." · "Essa é a
  Tricô Horizontal." · "Textura horizontal, gola careca." · "Acabamento premium, do P ao GG." · "Cento e trinta e
  nove e noventa, cada peça. Na primeira compra, use o cupom THEFIRST e ganhe dez por cento."
- **V2 (~20 s):** "Primeira compra? Essa camiseta de tricô sai por cento e vinte e cinco e noventa e um." ·
  "Escolha a cor e o tamanho." · "No carrinho, use o cupom THEFIRST." · "Pronto: cento e vinte e cinco e noventa e
  um, cada peça." · "Textura horizontal, toque macio, acabamento premium." · "Toque em comprar agora e garanta a sua."

### Documentos editáveis no Adobe Express

- Feed 4:5 (6 páginas): https://new.express.adobe.com/id/urn:aaid:sc:US:6aa3961b-99e5-4a08-af48-4ed053584e02
- Stories 9:16: https://new.express.adobe.com/id/urn:aaid:sc:US:3723adec-fb65-4ac4-84ce-60a0ffc79e3f
- Carrossel 1:1 (5 cards): https://new.express.adobe.com/id/urn:aaid:sc:US:097463d0-2603-48b1-a93c-4dbe42b813ee

No Express as fontes são as equivalentes do Adobe Fonts disponíveis no plano (League Gothic no lugar da Bebas Neue,
Montserrat no lugar da Inter, Playfair Display igual). Os PNGs em `out/estaticos` são a versão final de referência.

### Criativos de categoria (V3 e V4) — destino: https://loja.justcostore.com.br/verao/c

Catálogo da categoria Verão (conferido no site): Tshirt Tricot Color R$ 129,90 (preto, marinho) · T-shirt MC Tricot
Horizontal R$ 139,90 (off white, azul claro, verde) · T-shirt Tricot Polo MC Melt Green R$ 159,90 (verde) ·
T-shirt Tricot Bretanha R$ 169,90 (preto, marsala, jeans, aveia; até XG) · Tricot Bermuda R$ 189,90 (areia,
marinho, preto). Recortes novos feitos no Adobe (polo, Color preta, Bretanha aveia/marsala, bermuda marinho/preta).

**V3 · Vitrine Verão** — frame 0 é a vitrine da loja: as 5 peças com nome e preço e "5 modelos · a partir de
R$ 129,90 a peça" (qualifica pelo preço sem prender num produto). Depois: camisetas → polo de trama vazada (leveza,
do site) → bermuda com cordão ajustável (3 cores) → "tudo em tricô, do P ao XG" no vídeo → card "Coleção Verão",
cupom THEFIRST, botão "Ver coleção Verão", frete grátis acima de R$ 350.
- Narração: "Coleção Verão em tricô, a partir de cento e vinte e nove e noventa." · "Camisetas em tricô, em várias
  cores." · "Polo de trama vazada, que traz leveza." · "E bermuda de tricô, com cordão ajustável." · "Tudo em
  tricô, do P ao XG." · "Na primeira compra, use o cupom THEFIRST. Toque e veja a coleção."
- Texto principal: Coleção Verão JUST CO: camisetas, polo e bermuda em tricô, a partir de R$ 129,90 a peça. Do P ao
  XG. Na primeira compra, 10% OFF com o cupom THEFIRST.
- Título: Coleção Verão em tricô
- Descrição: A partir de R$ 129,90 a peça
- CTA: Ver mais / Comprar agora

**V4 · Monte seu look** — abre no vídeo com "MONTE SEU LOOK · TODO EM TRICÔ · CAMISETA + BERMUDA"; passo 1 troca as
4 camisetas com preço por peça; passo 2 troca as 3 cores da bermuda; passo 3 soma explícita "T-shirt Tricot
Bretanha R$ 169,90 + Tricot Bermuda R$ 189,90 = 2 peças: R$ 359,80 → FRETE GRÁTIS (compras acima de R$ 350)";
fecha com 3 looks e "Montar meu look". Puxa ticket médio para 2 peças. O cupom fica fora deste vídeo de propósito:
com 10% OFF o mesmo carrinho cai abaixo de R$ 350 e perderia o frete grátis.
- Narração: "Monte seu look de verão, todo em tricô." · "Primeiro, escolha a camiseta." · "Depois, combine com a
  bermuda." · "Bretanha e bermuda: trezentos e cinquenta e nove e oitenta. Acima de trezentos e cinquenta, o frete
  é grátis." · "Monte o seu na coleção Verão."
- Texto principal: Monte seu look de verão todo em tricô: camisetas a partir de R$ 129,90 e bermuda por R$ 189,90.
  Camiseta + bermuda passam de R$ 350 e o frete é grátis.
- Título: Camiseta + bermuda = frete grátis
- Descrição: Coleção Verão JUST CO
- CTA: Comprar agora

### Banners da home (link: /verao/c)

`out/banners/` — duas versões para aprovação, cada uma em desktop 2:1 (3840×1920, mesmo formato do slider atual,
que usa 3780×1890) e mobile 9:16 (2160×3840; o atual usa 2970×5280). Seguem a linguagem dos slides que já estão na
home: modelo de frente de um lado e de costas do outro, headline central, caixa "USE O CUPOM: THEFIRST", três
condições com ícones e divisórias (10% OFF na primeira compra · até 12x sem juros · frete grátis a partir de R$ 150
para SP, MG, SC, RS e PR — condição informada pelo cliente para os banners) e
CTA em pílula. Tipografia do site: Bebas Neue (como o título "COLEÇÃO VERÃO JUST CO" da home) + Inter. Fotos de
produto do site recortadas no Adobe.
- **A · clara:** fundo areia com luz de verão, look completo (T-shirt + Tricot Bermuda areia) de frente e de costas,
  "COLEÇÃO VERÃO", "Camisetas, polos e bermudas a partir de R$ 129,90", botão preto "Ver coleção verão".
- **B · escura:** fundo taupe no mesmo tom do slide "Cardigan", Polo MC Melt Green de frente e de costas, "VERÃO
  CHEGOU", "Os novos modelos da estação, a partir de R$ 129,90", botão bege (mesmo do "Ver mais modelos" atual).
- Regerar: `node render_banners.js` (fonte: `banners.html`).

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

**V2 · Primeira compra (como garantir a sua)**
- Identidade: só Bebas Neue + Inter e as cores do site (#151515, #FBFBFB, preço em verde #2CA98C, botão verde
  #25C793 igual ao "finalizar compra" da loja). Sem efeito de lupa/zoom de tecido: o bruto não tem resolução para isso.
- Gancho (frame 0): "PRIMEIRA COMPRA NA JUST CO? / T-SHIRT DE TRICÔ / DE R$ 139,90 POR R$ 125,91 · CADA PEÇA".
  Filtra quem ainda não comprou e já mostra o preço final, então quem clica chega decidido. R$ 125,91 = R$ 139,90
  com os 10% do cupom THEFIRST (válido na 1ª compra, segundo o site).
- Passos: 1/3 escolha a cor e o tamanho (off white, azul claro ou verde · do P ao GG) → 2/3 no carrinho, use o
  cupom THEFIRST → 3/3 pronto: R$ 125,91 a peça → o que você recebe → card final igual ao card de produto do site.
- Texto principal: Primeira compra na JUST CO? A T-shirt MC Tricot Horizontal sai de R$ 139,90 por R$ 125,91 cada
  peça com o cupom THEFIRST (10% OFF na primeira compra). Tricô com textura horizontal, gola careca, toque macio
  e acabamento premium. Do P ao GG.
- Título: R$ 125,91 a peça na 1ª compra
- Descrição: Cupom THEFIRST · 10% OFF
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
2. **Remarketing (visitou 14 dias / adicionou ao carrinho):** V2, E6, E5 e E7.
3. Escalar o vencedor com variações de hook.

## Como regenerar

```
python3 build_express.py                       # HTML autocontido para importar no Adobe Express
node render_statics.js [e1 …]                  # PNGs em out/estaticos
python3 narrate.py v1                          # voz + timeline (pip install edge-tts)
PAGE=v1.html node render_video.js video 30     # vídeo mudo (precisa de build/vf: ver abaixo)
python3 mix_music.py                           # música nas 4 versões (mudas de 15 s vêm do git: ver o script)
ffmpeg -i src/bruto.mp4 -vf "scale=1080:1920:flags=lanczos,eq=contrast=1.06:saturation=1.12:gamma=1.02,unsharp=5:5:0.6" -q:v 3 build/vf/%04d.jpg
```
