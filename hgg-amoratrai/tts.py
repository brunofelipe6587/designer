import asyncio, os, json, sys, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'   # trust the environment's proxy CA (verification stays on)
import edge_tts
TEXT, OUT, RATE = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else '+0%')
async def main():
    c = edge_tts.Communicate(TEXT, 'pt-BR-AntonioNeural', rate=RATE, proxy=os.environ.get('HTTPS_PROXY'), boundary='WordBoundary')
    words = []
    with open(OUT, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 't': ch['offset'] / 1e7, 'd': ch['duration'] / 1e7})
    json.dump(words, open(OUT.rsplit('.', 1)[0] + '_words.json', 'w'), ensure_ascii=False)
    print(len(words), 'words')
asyncio.run(main())
