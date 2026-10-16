#!/usr/bin/env bash
# Frames for vf1.html (Kit Feminino Void). The kit has no footage of its own: the plays come from the three
# women's futevôlei videos supplied by the client (v01–v03), each cut kept inside one source scene and clear of
# the burned-in captions in v02. 720p sources upscaled to 1080x1920 with a light sharpen.
set -euo pipefail
cd "$(dirname "$0")"
VF="scale=1080:1920:flags=lanczos,unsharp=5:5:0.5"
clip() {  # name video start end
  rm -rf frames/$1; mkdir -p frames/$1
  ffmpeg -v error -y -ss $3 -to $4 -i src/$2_insta.mp4 -vf "$VF" -r 30 -q:v 3 frames/$1/%04d.jpg
  echo "$1 $(ls frames/$1 | wc -l)"
}
# hook (one per 2 beats)
clip h1 v01 23.55 24.70   # header, jumping, hair flying
clip h2 v03 14.55 15.65   # header
clip h3 v01 20.95 22.05   # header with the ball
clip h4 v03 16.05 17.10   # close, hair flying
# after the drop (one per 2 beats)
clip m1 v02  4.35  5.45   # header under the Sand Walk arch
clip m2 v03  7.90  9.00   # chest control
clip m3 v01  4.75  5.28   # acrobatic kick (slow motion)
clip m4 v02  8.65  9.38   # kick
clip m5 v01 13.20 14.30   # play at the net
clip m6 v03 22.50 23.60   # chest control
clip m7 v01 26.30 27.30   # on the ball
clip m8 v01 15.00 16.00   # header
clip m9 v02  9.45 10.60   # high five
clip m10 v03 4.30  5.40   # high five / hug
# under the offer (one per bar, slower)
clip o1 v03 33.00 34.60   # hug
clip o2 v01 29.20 31.30   # celebrating
clip o3 v02  0.00  1.36   # Sand Walk logo close-up
