#!/usr/bin/env bash
# Void 1: mux the render with the brand video's soundtrack (prepared by prep_void1.sh, -14 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -i out/void1_silent.mp4 -i audio/mix_void1.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Void_V1_BicicletaNaAreia_9x16.mp4
echo done
