# Molduras do catálogo de sungas: Black Sand Walk

A Meta está trocando as **molduras** (frames) dos anúncios de catálogo por **modelos de imagem** (image templates),
criados no Commerce Manager. As molduras deixam de funcionar depois de 30/10/2026.

Por isso cada proporção tem 3 arquivos:

| Arquivo | Para que serve |
|---|---|
| `...-moldura-<proporção>.png` | Camada de cima: faixas pretas com a logo SAND WALK (canto superior esquerdo) e a oferta embaixo do produto. Tem fundo transparente na janela do produto. |
| `...-fundo-<proporção>.jpg` | Camada de baixo: fundo preto com uma luz amarela suave atrás do produto. |
| `...-exemplo-<proporção>.jpg` | Só para visualizar como fica com uma sunga. Não precisa subir. |

Proporções: **1:1** (1080×1080), **4:5 feed** (1080×1350) e **9:16 Stories/Reels** (1080×1920). No 9:16, a logo, o
produto e a oferta ficam dentro da área segura.

## Montagem no Commerce Manager (modelo de imagem)
Caminho: Commerce Manager → catálogo → Catálogo → **Modelos de imagem** → **+ Criar** → tela em branco.

1. **Camada de imagem** com o `fundo` (1080 de largura, ocupando a tela toda). Deixe essa camada por último na lista,
   para ela ficar atrás.
2. **Camada de produto**: ligue **remoção do plano de fundo** e **recortar para ajustar**. Posicione a sunga dentro da
   janela, conforme a tabela abaixo.
3. **Camada de imagem** com a `moldura` (tela toda), no topo da lista.
4. Repita nas proporções 4:5 e 9:16 (botões abaixo da prévia) usando os arquivos de cada uma e salve.
5. No Gerenciador de Anúncios, na campanha de vendas com o catálogo, vá em **Modelo de imagem → Escolher modelo**.
   Desligue **geração de plano de fundo** e **sobreposições dinâmicas**, para não cobrirem o modelo.

Janela do produto (x, y, largura, altura, em pixels):

| Proporção | Janela |
|---|---|
| 1:1 | 36, 140, 1008 × 680 |
| 4:5 | 36, 160, 1008 × 860 |
| 9:16 | 50, 380, 980 × 650 |

**Moldura antiga (frames):** se ainda estiver disponível na conta, use o `moldura-1x1` (PNG transparente, menor que
1 MB, 1080×1080) em "Adicionar moldura → Personalizada".

Oferta usada: 3 sungas por R$ 179 · de R$ 209,70 · só até 08/11.
