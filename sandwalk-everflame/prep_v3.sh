#!/usr/bin/env bash
# Frames for V3 "A foto vs. a peça". New here: the whole kit on the table (03, 5.9–7.5s, 60fps) that is compared with
# the site photo (src/site_mockup.jpg, the product image from the store page). Everything else is shared with V1/V2.
set -euo pipefail
cd "$(dirname "$0")"
F=frames; mkdir -p $F/r03
GRADE="eq=contrast=1.06:saturation=1.12:gamma=0.99,colorbalance=rs=-0.03:bs=0.04"
ffmpeg -v error -y -ss 5.9 -t 1.6 -i src/v03_flatlay.mp4 -vf "scale=1080:1920:flags=lanczos,$GRADE" -r 60 -q:v 3 $F/r03/%04d.jpg
[ -f $F/a02/0375.jpg ] && [ -f $F/m03/0156.jpg ] && [ -f $F/t03/0192.jpg ] && [ -f $F/k03/0174.jpg ] || ./prep_v2.sh
[ -f $F/g04a/0048.jpg ] && [ -f $F/g04b/0048.jpg ] || ./prep_v1.sh
echo ok
