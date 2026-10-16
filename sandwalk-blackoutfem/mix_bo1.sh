#!/usr/bin/env bash
# Kit Feminino Blackout creative 1: the track the client picked from reference video 3 ("essa menina é bipolar"),
# window 0–20.6 s, short fades, -14 LUFS, muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 0 -t 20.6 -i ../sandwalk-voidfem/src/v03_insta.mp4 -vn -af "aresample=48000,afade=t=in:d=0.02,afade=t=out:st=20.05:d=0.55,apad,atrim=0:20.6,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -ac 2 audio/mix_bo1.wav
ffmpeg -v error -y -i out/bo1_silent.mp4 -i audio/mix_bo1.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_BlackoutFeminino_V1_9x16.mp4
echo ok
