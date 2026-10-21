# Fabrício Veículos: edição padrão de anúncio (feed + stories)

Edição usada nos anúncios de veículos com destino ao WhatsApp. As informações do carro ficam
fixas na tela o vídeo inteiro, dentro da área segura de cada posicionamento, para o lead já chegar
sabendo local, ano, modelo, valor e entrada.

## O padrão (medido nos vídeos de referência em `referencia/`)

| | FEED | STORIES / REELS |
|---|---|---|
| Formato | 4:5, 1080×1350 | 9:16, 1080×1920 |
| Vídeo cru | 9:16 na altura toda, encostado à direita (x 312 → 1080, ~1% de corte vertical) | tela cheia |
| Informação | painel lateral esquerdo, 320 px (29,6% da largura) com borda vermelha de 8 px | faixa horizontal de 936 px (86,7%), centro em y≈1190 (62%) |
| Área segura | painel não sai da coluna esquerda; só a seta do VALOR avança até x≈392 | faixa entre o topo livre (14%) e a zona da interface do Reels (35% de baixo) |
| Tempo | estático do primeiro ao último quadro, sem cortes | idem |
| Áudio | original do vídeo cru | idem |

**Ordem do painel do feed** (de cima para baixo): logo → LOCALIZAÇÃO → MODELO → ANO → KM →
VALOR (caixa vermelha com seta) → ENTRADA A PARTIR DE → listras diagonais. A S10 usou
LOCALIZAÇÃO → ANO → MODELO e sem KM; isso se escolhe em `ordem_feed`.

**Ordem da faixa do stories**: LOCALIZAÇÃO | ANO | MARCA/MODELO | VALOR | ENTRADA (`ordem_stories`).

**Cores**: vermelho `#F40000` (gradiente `#FF2424` → `#7A0000` na caixa do valor), fundo preto com
reflexo diagonal sutil, texto branco com sombra.

**Tipografia**: Barlow Condensed itálico (rótulos 500, valores 800/900) e Barlow 800 itálico nos
rótulos da faixa. Centavos pequenos em cima, depois da vírgula (`204.990,⁹⁰`).

## Como gerar

1. Crie a pasta `carros/<nome-do-carro>/` com o vídeo cru (`.mp4`/`.mov`) e um `info.json`
   (copie de `carros/_modelo/info.json`).
2. Rode `node editar.js carros/<nome-do-carro> --provas`.
3. Saída em `out/<nome-do-carro>/`:
   - `<nome>_FEED_4x5.mp4` e `<nome>_STORIES_9x16.mp4` (H.264 + AAC, 30 fps, faststart)
   - `faixa_feed.png` / `faixa_stories.png`: as faixas em PNG transparente (dá para usar no Canva)
   - `quadro_feed.png`, `quadro_stories.png` e `prova_stories.png` (com as zonas de interface sombreadas)

`--so-faixas` gera só as faixas e as provas, sem renderizar os vídeos.

## Campos do `info.json`

| Campo | Exemplo | Obs. |
|---|---|---|
| `localizacao` | `["Juazeiro", "do Norte - CE"]` | duas linhas |
| `marca` | `"Chevrolet"` | aparece acima do modelo na faixa do stories; Chevrolet usa a gravata como ícone |
| `modelo` | `["S10", "LTZ 2.8 TB"]` | linha grande + linha menor |
| `ano` | `"2024"` | |
| `km` | `"120.000"` | opcional |
| `valor` / `centavos` | `"204.990"` / `"90"` | |
| `entrada` | `"50 mil"` | opcional; vira `R$ 50 MIL` |
| `ordem_feed` | `["localizacao","modelo","ano","km"]` | opcional |
| `ordem_stories` | `["localizacao","ano","modelo","valor","entrada"]` | opcional |
| `foco_x` / `foco_y` | `0.5` | de 0 a 1, para onde puxar o corte quando o vídeo cru não é 9:16 |
| `inicio` / `fim` | `2.5` / `60` | opcional, em segundos, para aparar o vídeo cru |
| `nome_arquivo` | `"S10_LTZ_2024"` | prefixo dos arquivos gerados |
