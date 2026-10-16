#!/usr/bin/env bash
# Shadow creative 2b: the client's funk track (window 23.40–39.00 s, after the explicit pre-chorus line) under shd2b.
# Short fade-in to avoid a click, fade-out at the end, -14 LUFS, muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 23.40 -t 15.6 -i src/trilha_quebrar_a_cama.mp3 -af "aresample=48000,afade=t=in:d=0.02,afade=t=out:st=14.9:d=0.7,apad,atrim=0:15.6,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -ac 2 audio/mix_shd2b.wav
ffmpeg -v error -y -i out/shd2b_silent.mp4 -i audio/mix_shd2b.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Shadow_V2b_TrilhaFunk_9x16.mp4
echo ok
