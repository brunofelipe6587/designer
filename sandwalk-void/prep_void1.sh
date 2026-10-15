#!/usr/bin/env bash
# Frames + audio for Void creative 1 "Bicicleta na areia".
#  - 02: the athlete's sand-court reel (720p) — upscaled to 1080x1920 with light sharpening, 12.9–28.6s.
#  - 01: studio product video (1080x1834) — cover-cropped to 1080x1920, 2.9–8.4s (zip pocket, fabric, logo).
#    The jacket shots in 01 (0–1.5s, 9.7–12.3s) are not used: the jacket is not part of this kit.
#  - Audio: 01's soundtrack (the brand's own product video), 0–18s.
set -euo pipefail
cd "$(dirname "$0")"
F=frames; A=audio; mkdir -p $F/a02 $F/p01 $A
GRADE="eq=contrast=1.08:saturation=1.10:gamma=0.98"
ffmpeg -v error -y -ss 12.9 -t 15.7 -i src/v02_insta.mp4 -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,$GRADE" -r 30 -q:v 3 $F/a02/%04d.jpg
ffmpeg -v error -y -ss 2.9 -t 5.5 -i src/v01_studio.mov -vf "scale=-2:1920:flags=lanczos,crop=1080:1920,$GRADE" -r 30 -q:v 3 $F/p01/%04d.jpg
ffmpeg -v error -y -i src/v01_studio.mov -vn -t 18.0 -ac 2 -ar 48000 -af "afade=t=out:st=17.4:d=0.6,loudnorm=I=-14:TP=-1.5:LRA=11" $A/mix_void1.wav
echo ok
