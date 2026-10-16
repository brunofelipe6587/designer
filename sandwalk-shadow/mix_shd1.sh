#!/usr/bin/env bash
# Shadow 1: voiceover (make_vo.py shd1) over the brand video track (Void product video), EQ-carved and ducked under the
# voice, up after the last line; -14 LUFS; muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=19.2; BED=../sandwalk-void/src/v01_studio.mov
ffmpeg -v error -y -i $A/vo_shd1.wav -i $BED -filter_complex "\
[1:a]aresample=48000,equalizer=f=2000:t=q:w=1.2:g=-8,volume='if(lt(t,17.9),0.17,0.8)':eval=frame,afade=t=out:st=18.4:d=0.7[bed];\
[0:a][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_shd1.wav
ffmpeg -v error -y -i out/shd1_silent.mp4 -i $A/mix_shd1.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Shadow_V1_9x16.mp4
echo done
