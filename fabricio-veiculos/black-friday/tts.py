# Voz de IA (edge-tts) + tempo de cada palavra: python3 -I tts.py "texto" saida.mp3 [+10%] [pt-BR-AntonioNeural]
import asyncio, os, json, sys, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'   # confia na CA do proxy do ambiente (verificação continua ligada)
import edge_tts
TEXT, OUT = sys.argv[1], sys.argv[2]
RATE = sys.argv[3] if len(sys.argv) > 3 else '+0%'
VOICE = sys.argv[4] if len(sys.argv) > 4 else 'pt-BR-AntonioNeural'
async def main():
    c = edge_tts.Communicate(TEXT, VOICE, rate=RATE, proxy=os.environ.get('HTTPS_PROXY'), boundary='WordBoundary')
    words = []
    with open(OUT, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 't': ch['offset'] / 1e7, 'd': ch['duration'] / 1e7})
    json.dump(words, open(OUT.rsplit('.', 1)[0] + '_words.json', 'w'), ensure_ascii=False)
asyncio.run(main())
