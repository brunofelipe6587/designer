#!/usr/bin/env bash
# Frames for V2 "3 detalhes": athlete (02), flat lay macros (03, 60fps for slow motion), the creator's pocket take (05).
set -euo pipefail
cd "$(dirname "$0")"
F=frames; mkdir -p $F/a02 $F/m03 $F/t03 $F/k03
GRADE="eq=contrast=1.06:saturation=1.12:gamma=0.99,colorbalance=rs=-0.03:bs=0.04"
ffmpeg -v error -y -ss 0 -t 12.5 -i src/v02_atleta.mp4 -vf "scale=1080:1920:flags=lanczos,$GRADE" -r 30 -q:v 3 $F/a02/%04d.jpg   # athlete 0–12.5s
ffmpeg -v error -y -ss 15.3 -t 2.6 -i src/v03_flatlay.mp4 -vf "scale=1080:1920:flags=lanczos,$GRADE" -r 60 -q:v 3 $F/m03/%04d.jpg  # mesh + SW logo macro
ffmpeg -v error -y -ss 0 -t 3.2 -i src/v03_flatlay.mp4 -vf "scale=1080:1920:flags=lanczos,$GRADE" -r 60 -q:v 3 $F/t03/%04d.jpg     # Sand Walk tag + side panels
ffmpeg -v error -y -ss 3.9 -t 2.9 -i src/v03_flatlay.mp4 -vf "scale=1080:1920:flags=lanczos,$GRADE" -r 60 -q:v 3 $F/k03/%04d.jpg   # whole kit from above
[ -f $F/u05all/0690.jpg ] || ./prep_v1b.sh   # creator's take (pocket), shared with V1b/V1c
echo ok
