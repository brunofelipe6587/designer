# Extracts per-shot frames for videoV2.html from ugc/raw2/<IMG_xxxx>.mp4 — 1080x1920 30fps proxies of the client's Drive clips, made with
#   ffmpeg -i IMG_xxxx.MOV -vf "fps=30,scale=1080:1920:flags=lanczos,format=yuv420p" -c:v libx264 -crf 16 -c:a aac ugc/raw2/IMG_xxxx.mp4
# (vo4 = presenter proxy ugc/raw/vo4_1080.mov from prep_v1.sh). The shot table is exported to build/v2_shots.js for videoV2.html.
import subprocess, os, json
D = os.path.dirname(os.path.abspath(__file__))
B = 0.63125 * 4  # bar length (Power Beat 2, ~95 bpm)
SHOTS = [  # t0, t1, clip, srcStart, speed, label
    [0.0, B / 2, 'IMG_9041', 0.0, 0.85, ''],
    [B / 2, B, 'IMG_9042', 0.215, 1.0, ''],
    [B, B * 1.5, 'IMG_9043', 0.09, 1.0, ''],
    [B * 1.5, B * 2, 'IMG_9043', 1.35, 0.34, ''],
    [B * 2, B * 2.5, 'vo4', 37.0, 1.0, 'LAVAGEM CLARA'],
    [B * 2.5, B * 3, 'IMG_8993', 8.0, 1.0, 'PRETA'],
    [B * 3, B * 3.5, 'IMG_9018', 9.6, 1.0, 'CAIMENTO PERFEITO'],
    [B * 3.5, B * 4, 'IMG_8978', 3.0, 1.0, 'AZUL'],
    [B * 4, B * 4.5, 'IMG_8978', 14.5, 1.0, 'ACABAMENTO DE FÁBRICA'],
    [B * 4.5, B * 5, 'IMG_9017', 6.0, 1.0, 'PRETA MARMORIZADA'],
    [B * 5, B * 6, 'IMG_9045', 0.75, 0.3, ''],
    [B * 6, B * 7, 'IMG_8993', 23.5, 1.0, ''],
    [B * 7, B * 7 + 4.46, 'IMG_8978', 23.0, 1.0, ''],
]
if __name__ == '__main__':
    out = []
    for i, (t0, t1, clip, s0, sp, lab) in enumerate(SHOTS):
        d = f'{D}/ugc/frames/v2/s{i:02d}'; os.makedirs(d, exist_ok=True)
        dur = (t1 - t0) * sp + 0.15
        src = f'{D}/ugc/raw/vo4_1080.mov' if clip == 'vo4' else f'{D}/ugc/raw2/{clip}.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s0), '-i', src, '-t', str(dur), '-vf', 'fps=30', '-q:v', '2', '-start_number', '1', f'{d}/%04d.jpg'], check=True)
        n = len(os.listdir(d)); out.append([round(t0, 4), round(t1, 4), i, sp, n, lab])
    open(f'{D}/build/v2_shots.js', 'w').write('window.SHOTS=' + json.dumps(out, ensure_ascii=False) + ';')
    print(out)
