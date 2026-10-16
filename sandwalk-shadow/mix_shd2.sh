#!/usr/bin/env bash
# Shadow creative 2: original beat (make_beat.py, no samples) levelled to -14 LUFS and muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
[ -f audio/beat_shd2.wav ] || python3 make_beat.py
ffmpeg -v error -y -i audio/beat_shd2.wav -af "loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000,apad,atrim=0:15.6" audio/mix_shd2.wav
ffmpeg -v error -y -i out/shd2_silent.mp4 -i audio/mix_shd2.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Shadow_V2_BeatCut_9x16.mp4
echo ok
