#!/usr/bin/env bash
# Background action for ftv2b.html: seven plays from other Sand Walk shoots (Shadow = shd, Void = vd), one per bar,
# each kept inside a single source scene. Shown in black and white behind the product card.
set -euo pipefail
cd "$(dirname "$0")"
clip() {  # name src start end
  mkdir -p frames/$1
  ffmpeg -v error -y -ss $3 -to $4 -i $2 -vf "scale=1080:1920:flags=lanczos" -r 30 -q:v 3 frames/$1/%04d.jpg
  echo "$1 $(ls frames/$1 | wc -l)"
}
SHD=../sandwalk-shadow/src/v01_insta.mp4; VD=../sandwalk-void/src/v02_insta.mp4
clip b1 $SHD 14.90 17.72   # bicycle kick, indoor court
clip b2 $VD   4.10  6.90   # juggling
clip b3 $VD  15.20 17.00   # bicycle kick
clip b4 $VD  10.30 13.10   # chest control
clip b5 $SHD  3.45  4.65   # kick close to camera (slow motion)
clip b6 $VD  28.60 31.40   # run-up + bicycle kick
clip b7 $VD   0.20  3.00   # receiving / juggling
