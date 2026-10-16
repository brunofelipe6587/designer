#!/usr/bin/env bash
# Kit Futevôlei Preto creative 2: original lo-fi track (make_beat2.py) at -14 LUFS, muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
[ -f audio/lofi_ftv2.wav ] || python3 make_beat2.py
ffmpeg -v error -y -i audio/lofi_ftv2.wav -af "loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000,apad,atrim=0:19.76" -ac 2 audio/mix_ftv2.wav
ffmpeg -v error -y -i out/ftv2_silent.mp4 -i audio/mix_ftv2.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_FutevoleiPreto_V2_TourDoKit_9x16.mp4
echo ok
