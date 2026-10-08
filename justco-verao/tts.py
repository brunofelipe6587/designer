# Usage: python3 tts.py "texto" out.mp3 [rate] [pitch]   -> out.mp3 + out_words.json (word timings)
# Voice: pt-BR-AntonioNeural, slowed down and pitched lower for a calmer, more premium read.
import asyncio, os, json, sys, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'   # trust the environment's proxy CA (verification stays on)
import edge_tts

TEXT, OUT = sys.argv[1], sys.argv[2]
RATE = sys.argv[3] if len(sys.argv) > 3 else '-6%'
PITCH = sys.argv[4] if len(sys.argv) > 4 else '-6Hz'


async def main():
    c = edge_tts.Communicate(TEXT, 'pt-BR-AntonioNeural', rate=RATE, pitch=PITCH,
                             proxy=os.environ.get('HTTPS_PROXY'), boundary='WordBoundary')
    words = []
    with open(OUT, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append({'w': ch['text'], 't': ch['offset'] / 1e7, 'd': ch['duration'] / 1e7})
    json.dump(words, open(OUT.rsplit('.', 1)[0] + '_words.json', 'w'), ensure_ascii=False)
    print(len(words), 'words', OUT)

asyncio.run(main())
