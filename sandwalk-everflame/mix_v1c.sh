#!/usr/bin/env bash
# V1c audio: the creator's original take, continuous from 0 to 22.5s (no cuts), cleaned and loudness-normalised.
set -euo pipefail
cd "$(dirname "$0")"
A=audio; mkdir -p $A
ffmpeg -v error -y -ss 0 -to 22.5 -i src/v05_ugc.mp4 -vn -ac 2 -ar 48000 \
  -af "highpass=f=90,afftdn=nf=-30,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,afade=t=out:st=22.42:d=0.08,loudnorm=I=-14:TP=-1.5:LRA=11" \
  $A/mix_v1c.wav
ffmpeg -v error -y -i out/v1c_silent.mp4 -i $A/mix_v1c.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  out/SandWalk_EverFlame_V1c_TakeUnico_9x16.mp4
echo done
