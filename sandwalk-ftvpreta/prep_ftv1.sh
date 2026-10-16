#!/usr/bin/env bash
# Frames for ftv1.html. This kit has no footage of its own, so the action comes from other Sand Walk shoots
# (shown in black and white in the edit): the bicycle kick from the Shadow video and juggling from the Void video.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 15.0 -t 2.9 -i ../sandwalk-shadow/src/v01_insta.mp4 -vf "scale=1080:1920:flags=lanczos" -r 30 -q:v 3 frames/shd/%04d.jpg
ffmpeg -v error -y -ss 3.2 -t 2.4 -i ../sandwalk-void/src/v02_insta.mp4 -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.6" -r 30 -q:v 3 frames/vd/%04d.jpg
echo ok
