# Black Sand Walk — semana 1 (sungas): como as artes são montadas

- `src/atleta1-3.jpg`: fotos dos atletas parceiros enviadas pelo cliente. `src/sunga_*.jpg`: fotos das páginas de produto
  (Blackout, All Black, Graffiti Branco). `src/logo.svg`: logo largo "SAND WALK" do topo do site.
- Recortes: máscaras geradas no Adobe (select subject / select by prompt) e aplicadas localmente sobre os pixels
  ORIGINAIS (`build/cut1-3.png`) — os rostos não passam por nenhuma edição. Na foto 1, a máscara da criança foi
  subtraída da máscara do atleta; o espaço que ela deixava no peito dele fica atrás do atleta do meio na arte.
- Sungas: fundo removido no Adobe (`build/sunga_*_crop.png`); na arte recebem luz de estúdio (spot, contorno de luz e reflexo).
- Bola (foto 2): a figura da marca de terceiros foi removida (`retouch_ball.py`) e a bola recolorida nas cores Sand Walk (preto + #FFCC29, com o logo SW) por `recolor_ball.py` — só pixels da bola (máscara do Adobe, mãos fora); o script confere que nenhum pixel fora da bola muda.

- Artes: `desktop.html` (1920×960) → `node shot.js desktop.html out/<nome>.jpg`.
- Amarelo: #FFCC29 (o destaque usado no site: etiquetas, tamanho selecionado). Syne bold nos títulos, Inter no apoio.
