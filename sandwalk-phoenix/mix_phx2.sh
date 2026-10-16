#!/usr/bin/env bash
# Phoenix 1B (split screen, no voiceover): mux the render with the brand video track (0–12.17 s, -14 LUFS) and export
#  - 9:16 1080x1920 for Stories/Reels
#  - 4:5 1080x1350 for Feed: the layout's safe band (y 285–1635), so every piece of information is the same in both.
set -euo pipefail
cd "$(dirname "$0")"
[ -f audio/mix_phx2.wav ] || ffmpeg -v error -y -i ../sandwalk-void/src/v01_studio.mov -vn -t 12.17 -ac 2 -ar 48000 \
  -af "afade=t=out:st=11.6:d=0.57,loudnorm=I=-14:TP=-1.5:LRA=11" audio/mix_phx2.wav
ffmpeg -v error -y -i out/phx2_silent.mp4 -i audio/mix_phx2.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Phoenix_V1B_TelaDividida_9x16.mp4
ffmpeg -v error -y -i out/phx2_silent.mp4 -i audio/mix_phx2.wav -map 0:v -map 1:a -vf "crop=1080:1350:0:285" -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Phoenix_V1B_TelaDividida_4x5.mp4
echo done
