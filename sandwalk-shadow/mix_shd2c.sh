#!/usr/bin/env bash
# Shadow creative 2c: the client's funk track, window 109.65–129.65 s (calm pre-drop, drop at 115.30, the song's own
# ending), short fades, -14 LUFS, muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 109.65 -t 20 -i src/trilha_quebrar_a_cama.mp3 -af "aresample=48000,afade=t=in:d=0.03,afade=t=out:st=19.3:d=0.7,apad,atrim=0:20,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -ac 2 audio/mix_shd2c.wav
ffmpeg -v error -y -i out/shd2c_silent.mp4 -i audio/mix_shd2c.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Shadow_V2c_Claro_9x16.mp4
echo ok
