#!/usr/bin/env bash
# Frames for Void creative 2 "Bolso com zíper?". New here: the second zip-pocket close-up in 01 (12.4–14.7s).
# Reuses a02 (athlete, 12.9–28.6s) and p01 (01, 2.9–8.4s) from prep_void1.sh; voiceover from make_vo.py void2.
set -euo pipefail
cd "$(dirname "$0")"
F=frames; mkdir -p $F/z01
GRADE="eq=contrast=1.08:saturation=1.10:gamma=0.98"
ffmpeg -v error -y -ss 12.4 -t 2.3 -i src/v01_studio.mov -vf "scale=-2:1920:flags=lanczos,crop=1080:1920,$GRADE" -r 30 -q:v 3 $F/z01/%04d.jpg
[ -f $F/a02/0471.jpg ] && [ -f $F/p01/0165.jpg ] || ./prep_void1.sh
[ -f audio/vo_void2.wav ] || python3 make_vo.py void2
echo ok
