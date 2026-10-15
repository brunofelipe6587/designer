#!/usr/bin/env bash
# Mixes V1: influencer voice lines placed on the edit timeline + Ever Flame film soundtrack as bed
# (ducked under the voice, full on the offer impact), then loudness-normalised for Meta (-14 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=14.8
ffmpeg -v error -y \
  -i $A/vo1.wav -i $A/vo2.wav -i $A/vo3.wav -i $A/vo4.wav -i $A/vo5.wav -i $A/vo6.wav -i $A/bed.wav \
  -filter_complex "\
[0]adelay=0|0[a0];[1]adelay=2400|2400[a1];[2]adelay=4580|4580[a2];[3]adelay=5300|5300[a3];[4]adelay=6700|6700[a4];[5]adelay=9120|9120[a5];\
[a0][a1][a2][a3][a4][a5]amix=inputs=6:normalize=0,apad[vo];\
[6]adelay=180|180,volume='if(lt(t,10.45),0.45,1.0)':eval=frame,afade=t=out:st=14.2:d=0.6[bed];\
[vo][bed]amix=inputs=2:normalize=0:duration=longest,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_v1.wav
ffmpeg -v error -y -i out/v1_silent.mp4 -i $A/mix_v1.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  out/SandWalk_EverFlame_V1_QuePressao_9x16.mp4
echo done
