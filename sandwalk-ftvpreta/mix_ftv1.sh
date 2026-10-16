#!/usr/bin/env bash
# Kit Futevôlei Preto creative 1: original track (make_beat.py) at -14 LUFS, muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
[ -f audio/beat_ftv.wav ] || python3 make_beat.py
ffmpeg -v error -y -i audio/beat_ftv.wav -af "loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000,apad,atrim=0:19.2" -ac 2 audio/mix_ftv1.wav
ffmpeg -v error -y -i out/ftv1_silent.mp4 -i audio/mix_ftv1.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_FutevoleiPreto_V1_9x16.mp4
echo ok
