#!/usr/bin/env bash
# Mixes V1b: only the creator's voice, his lines placed back to back on the edit timeline (organic cut, no music bed).
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=13.05
ffmpeg -v error -y -i $A/b1.wav -i $A/b2.wav -i $A/b3.wav -i $A/b4.wav -i $A/b5.wav -i $A/b6.wav -i $A/b7.wav -i $A/b8.wav \
  -filter_complex "\
[0]adelay=0|0[a0];[1]adelay=440|440[a1];[2]adelay=2860|2860[a2];[3]adelay=5260|5260[a3];\
[4]adelay=5980|5980[a4];[5]adelay=7380|7380[a5];[6]adelay=9800|9800[a6];[7]adelay=11380|11380[a7];\
[a0][a1][a2][a3][a4][a5][a6][a7]amix=inputs=8:normalize=0,apad,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_v1b.wav
ffmpeg -v error -y -i out/v1b_silent.mp4 -i $A/mix_v1b.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  out/SandWalk_EverFlame_V1b_Organico_9x16.mp4
echo done
