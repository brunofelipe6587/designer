#!/usr/bin/env bash
# Kit Feminino Void creative 1: the trap track from reference video 1 (src/v01_insta.mp4), window 8.0–28.6 s
# (starts after the "dose de whisky" line, drop at 12.17 s = 4.17 s video time), short fades, -14 LUFS.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 8.0 -t 20.6 -i src/v01_insta.mp4 -vn -af "aresample=48000,afade=t=in:d=0.04,afade=t=out:st=20.05:d=0.55,apad,atrim=0:20.6,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -ac 2 audio/mix_vf1.wav
ffmpeg -v error -y -i out/vf1_silent.mp4 -i audio/mix_vf1.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_VoidFeminino_V1_9x16.mp4
echo ok
