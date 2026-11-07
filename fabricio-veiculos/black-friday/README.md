# Black Friday Fabrício Veículos

Oferta: condições de Black com **tanque cheio + documentação inclusa em todos os carros**, em
Juazeiro do Norte - CE. Três criativos diferentes, cada um em STORIES 9:16 e FEED 4:5:

| # | Criativo | Áudio | Estrutura |
|---|---|---|---|
| 1 | Música | "Vaqueiro" (Flash Z) do "só a cama vai ter ressaca" até o fim do refrão (30,0 s → 57,45 s) | gancho BLACK FRIDAY → oferta → 1 carro por vez com card de preço → WhatsApp; cortes e flashes nas batidas/"flash" da letra |
| 2 | Voz de IA | locução pt-BR (edge-tts, Antonio) + som ambiente baixo | abertura → oferta → cada carro com a faixa/painel padrão e legenda palavra a palavra → WhatsApp |
| 3 | Vitrine | voz curta (Thalita) no início e no fim + som ambiente | grade com os 3 carros e preços já no 1º segundo → cada carro → grade + WhatsApp (funciona sem som) |

Todos mostram localização e preço desde o início e terminam pedindo para mandar o **nome do carro**
no WhatsApp, o que já qualifica a conversa.

## Gerar
`node black.js` (todos) ou `node black.js musica|voz|vitrine [--so-stories|--so-feed]`.
Saída em `../out/black-friday/`.

## Completar os carros
Em `campanha.json`, cada carro sem `pasta` aparece como "VÍDEO PENDENTE". Para completar:
1. crie `carros/<pasta>/` com `bruto.mp4` e `info.json` (como nos outros carros);
2. no carro em `campanha.json`, preencha `pasta`, `versao`, `ano`, `km`, `valor`, `centavos`,
   `entrada`, `clipes` (trechos frente/lateral/interior/bancos/traseira/final em segundos) e a `fala`
   da locução com os números.
