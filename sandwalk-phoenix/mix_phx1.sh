#!/usr/bin/env bash
# Phoenix 1: voiceover (make_vo.py phx1) + the brand's Ever Flame film soundtrack as bed (fire theme). The bed's ambient
# intro is laid twice so its first impact (src 10.5 s) lands on the offer (18.27 s); ducked under the voice, up after it.
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=24.0; D=7770; BED=../sandwalk-everflame/src/v01_studio.mp4
ffmpeg -v error -y -i $A/vo_phx1.wav -i $BED -i $BED -filter_complex "\
[1:a]atrim=0:8.1,asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=7.7:d=0.4[b1];\
[2:a]asetpts=PTS-STARTPTS,adelay=$D|$D,afade=t=in:st=7.77:d=0.4[b2];\
[b1][b2]amix=inputs=2:normalize=0,volume='if(lt(t,22.85),0.40,0.95)':eval=frame,afade=t=out:st=23.4:d=0.6[bed];\
[0:a][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_phx1.wav
ffmpeg -v error -y -i out/phx1_silent.mp4 -i $A/mix_phx1.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Phoenix_V1_3Pecas_9x16.mp4
echo done
