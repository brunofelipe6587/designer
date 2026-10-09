"""Monta o criativo 03: vídeo bruto (estendido no final) + camadas + ticker animado."""
import json
import subprocess
import sys

SRC, LAYERS_DIR, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SRC_DUR = 29.418
EXTRA = 2.0                      # congela a vinheta final para dar tempo à cartela
DUR = round(SRC_DUR + EXTRA, 3)

layers = json.load(open(f"{LAYERS_DIR}/layers.json"))

args = ["ffmpeg", "-v", "error", "-y", "-i", SRC]
for l in layers:
    args += ["-loop", "1", "-framerate", "30", "-t", str(DUR), "-i", l["file"]]

fc = [
    f"[0:v]setpts=PTS-STARTPTS,scale=1080:1920:flags=lanczos,setsar=1,"
    f"tpad=stop_mode=clone:stop_duration={EXTRA},eq=contrast=1.04:saturation=1.06,"
    f"fps=30,format=yuv420p[b0]"
]
prev = "b0"
for i, l in enumerate(layers, start=1):
    t0, t1 = l["t0"], l["t1"]
    fade = f"fade=in:st={t0}:d=0.22:alpha=1" if t0 > 0 else "null"
    if t1 < DUR - 0.01:
        fade += f",fade=out:st={t1 - 0.18:.3f}:d=0.18:alpha=1"
    fc.append(f"[{i}:v]format=rgba,{fade}[l{i}]")
    if l.get("ticker"):
        x = f"'-mod(t*{l['speed']},{l['period']})'"
        y = str(l["y"])
    else:
        s, dx = l.get("slide", 0), l.get("dx", 0)
        x = f"'{dx}*pow(max(0,1-(t-{t0})/0.3),2)'" if dx and t0 > 0 else "0"
        y = f"'{s}*pow(max(0,1-(t-{t0})/0.28),2)'" if s and t0 > 0 else "0"
    fc.append(f"[{prev}][l{i}]overlay=x={x}:y={y}:enable='between(t,{t0},{t1})'[b{i}]")
    prev = f"b{i}"
fc.append(f"[0:a]asetpts=PTS-STARTPTS,apad=pad_dur={EXTRA},"
          f"afade=t=out:st={DUR - 1.2}:d=1.2[a]")

args += ["-filter_complex", ";".join(fc), "-map", f"[{prev}]", "-map", "[a]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", "-t", str(DUR), OUT]
subprocess.run(args, check=True)
print("ok", OUT, DUR)
