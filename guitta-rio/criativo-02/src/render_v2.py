"""Monta o criativo com ffmpeg a partir do vídeo bruto + camadas PNG."""
import json
import subprocess
import sys

SRC, LAYERS_DIR, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
TRIM = 0.0
DUR = 17.9
HOOK = 2.4

layers = json.load(open(f"{LAYERS_DIR}/layers.json"))

args = ["ffmpeg", "-v", "error", "-y", "-ss", str(TRIM), "-t", str(DUR), "-i", SRC]
for l in layers:
    args += ["-loop", "1", "-framerate", "30", "-t", str(DUR), "-i", l["file"]]

# Base: upscale para 1080x1920, punch-in no gancho, leve ajuste de cor
z = f"if(lt(t,{HOOK}),1.07-0.07*t/{HOOK},1)"
fc = [
    f"[0:v]setpts=PTS-STARTPTS,scale=1080:1920:flags=lanczos,"
    f"scale=w='trunc(1080*{z}/2)*2':h='trunc(1920*{z}/2)*2':eval=frame:flags=bicubic,"
    f"crop=1080:1920,eq=contrast=1.05:saturation=1.08,gblur=sigma=14:enable='gte(t,13.65)',fps=30,format=yuv420p[b0]"
]
prev = "b0"
for i, l in enumerate(layers, start=1):
    t0, t1, s, dx = l["t0"], l["t1"], l["slide"], l.get("dx", 0)
    fade = f"fade=in:st={t0}:d=0.22:alpha=1" if t0 > 0 else "null"
    if t1 < DUR - 0.01:
        fade += f",fade=out:st={t1 - 0.14:.3f}:d=0.14:alpha=1"
    fc.append(f"[{i}:v]format=rgba,{fade}[l{i}]")
    # desliza de baixo para cima (ease-out) ao entrar
    x = "0" if t0 == 0 else f"'{dx}*pow(max(0,1-(t-{t0})/0.3),2)'" if dx else "0"
    y = f"'{s}*pow(max(0,1-(t-{t0})/0.28),2)'" if s else "0"
    fc.append(f"[{prev}][l{i}]overlay=x={x}:y={y}:enable='between(t,{t0},{t1})'[b{i}]")
    prev = f"b{i}"
fc.append(f"[0:a]asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.08,"
          f"afade=t=out:st={DUR - 0.7}:d=0.7[a]")

args += ["-filter_complex", ";".join(fc), "-map", f"[{prev}]", "-map", "[a]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", "-t", str(DUR), OUT]
subprocess.run(args, check=True)
print("ok", OUT)
