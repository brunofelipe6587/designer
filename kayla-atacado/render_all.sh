#!/bin/bash
# Renders every Kayla creative and muxes it with its audio: ./render_all.sh [video1 video2 video3a video3b video4]
set -u
cd "$(dirname "$0")"
for p in ${@:-video1 video2 video3a video3b video4}; do
  case $p in
    video1)  d=33.0; a=out/video1_audio.m4a; o=Kayla_Atacado_9x16_1_Fran ;;
    video2)  d=27.4; a=out/video2_audio.m4a; o=Kayla_Atacado_9x16_2_PassoAPasso ;;
    video3a) d=27.4; a=out/video2_audio.m4a; o=Kayla_Atacado_9x16_3A_Conta ;;
    video3b) d=27.4; a=out/video2_audio.m4a; o=Kayla_Atacado_9x16_3B_Conta ;;
    video4)  d=21.7; a=out/video4_audio.m4a; o=Kayla_Atacado_9x16_4_Loja ;;
  esac
  rm -f out/${p}_silent.mp4
  PAGE=$p.html DUR=$d node render.js video 30 > build/render_$p.log 2>&1 || { echo "FAILED $p"; tail -5 build/render_$p.log; continue; }
  ffmpeg -y -loglevel error -i out/${p}_silent.mp4 -i $a -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart out/$o.mp4
  echo "$o $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$o.mp4)"
done
