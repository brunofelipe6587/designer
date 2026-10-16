#!/usr/bin/env bash
# Frames for Shadow creative 1: the athlete's reel (720p) upscaled to 1080x1920 with light sharpening, whole clip.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p frames/v01
ffmpeg -v error -y -i src/v01_insta.mp4 -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,eq=contrast=1.06:saturation=1.08" -r 30 -q:v 3 frames/v01/%04d.jpg
[ -f audio/vo_shd1.wav ] || python3 make_vo.py shd1
echo ok
