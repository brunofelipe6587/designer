#!/usr/bin/env bash
# Phoenix 1B (clean split-screen Reel, no voiceover): mux the render with the Ever Flame film soundtrack (src 3–15 s:
# ambient intro, first impact at 7.5 s on the last photo change), -14 LUFS.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 3.0 -t 12.0 -i ../sandwalk-everflame/src/v01_studio.mp4 -vn -ac 2 -ar 48000 \
  -af "afade=t=in:d=0.3,afade=t=out:st=11.3:d=0.7,loudnorm=I=-14:TP=-1.5:LRA=11" audio/mix_phx1b.wav
ffmpeg -v error -y -i out/phx1b_silent.mp4 -i audio/mix_phx1b.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Phoenix_V1B_Clean_9x16.mp4
echo done
