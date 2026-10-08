# Narration for V1/V2: one TTS line per visual block, each block re-timed to its line so the voice changes exactly
# on the cut. Usage: python3 narrate.py v1|v2  -> audio/timeline_<v>.js (window.TIMELINE) + audio/<v>_voz.wav
# The brand name is never spoken (no TTS spelling of "Just Co" sounded right); the logo carries it on screen.
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).parent
RATE, PITCH = '+8%', '-8Hz'
LEAD, TAIL = 0.12, 0.30          # silence before / after each line inside its block

# design-time block boundaries (as authored in v1.html / v2.html) and the line spoken over each block
SCRIPTS = {
    'v1': {
        'bounds': [0.0, 2.8, 5.0, 7.0, 8.9, 11.0, 15.0],
        'lines': [
            'Camiseta de tricô, pra homem que se veste bem.',
            'Toque macio, caimento premium.',
            'Essa é a Tricô Horizontal.',
            'Textura horizontal, gola careca.',
            'Acabamento premium, do pê ao gê gê.',
            'Cento e trinta e nove e noventa, cada peça. Na primeira compra, use o cupom THEFIRST e ganhe dez por cento.',
        ],
    },
    'v2': {
        'bounds': [0.0, 2.7, 5.2, 7.7, 10.2, 12.0, 15.0],
        'lines': [
            'Primeira compra? Essa camiseta de tricô sai por cento e vinte e cinco e noventa e um.',
            'Escolha a cor e o tamanho.',
            'No carrinho, use o cupom THEFIRST.',
            'Pronto: cento e vinte e cinco e noventa e um, cada peça.',
            'Textura horizontal, toque macio, acabamento premium.',
            'Toque em comprar agora e garanta a sua.',
        ],
    },
}


def run(*cmd):
    subprocess.run(cmd, check=True)


def main(v):
    sc = SCRIPTS[v]
    d, lines = sc['bounds'], sc['lines']
    tmp = ROOT / 'build' / f'narr_{v}'
    tmp.mkdir(parents=True, exist_ok=True)
    actual, clips = [0.0], []
    for i, line in enumerate(lines):
        mp3 = tmp / f'{i}.mp3'
        run('python3', str(ROOT / 'tts.py'), line, str(mp3), RATE, PITCH)
        words = json.load(open(tmp / f'{i}_words.json'))
        s0, s1 = words[0]['t'], words[-1]['t'] + words[-1]['d']
        speech = s1 - s0
        design = d[i + 1] - d[i]
        block = max(design * 0.85, LEAD + speech + TAIL)
        if i == len(lines) - 1:
            block = max(block, LEAD + speech + 1.2)   # let the end card breathe after the last word
        clips.append((mp3, s0, actual[-1] + LEAD))
        actual.append(round(actual[-1] + block, 3))
        print(f'{v} block {i}: design {design:.2f}s  speech {speech:.2f}s  -> {block:.2f}s')
    total = actual[-1]
    # place each clip (trimmed to its first word) at its block start; mastering: warm, compressed, -16 LUFS
    inputs, filters = [], []
    for k, (mp3, s0, at) in enumerate(clips):
        inputs += ['-i', str(mp3)]
        filters.append(f'[{k}:a]atrim=start={max(0, s0 - 0.03):.3f},asetpts=PTS-STARTPTS,adelay={int(at * 1000)}:all=1[a{k}]')
    mix = ''.join(f'[a{k}]' for k in range(len(clips)))
    filters.append(f'{mix}amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{total:.3f},'
                   'highpass=f=70,equalizer=f=140:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.2:g=1.5,'
                   'acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,'
                   'aecho=0.85:0.5:38:0.08,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000[out]')
    out = ROOT / 'audio' / f'{v}_voz.wav'
    out.parent.mkdir(exist_ok=True)
    run('ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filters), '-map', '[out]', '-ac', '2', str(out))
    tl = {'design': d, 'actual': actual}
    (ROOT / 'audio' / f'timeline_{v}.js').write_text(f'window.TIMELINE = {json.dumps(tl)};\n')
    print(v, 'total', total, 's', out.relative_to(ROOT))


if __name__ == '__main__':
    main(sys.argv[1])
