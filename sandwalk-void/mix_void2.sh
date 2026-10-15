#!/usr/bin/env bash
# Void 2: voiceover (make_vo.py void2) over the brand video's track as bed (ducked under the voice, up at the end),
# loudness-normalised and muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=20.0
ffmpeg -v error -y -i $A/vo_void2.wav -i src/v01_studio.mov -filter_complex "\
[1:a]aresample=48000,equalizer=f=2000:t=q:w=1.2:g=-8,volume='if(lt(t,18.2),0.17,0.85)':eval=frame,afade=t=out:st=18.6:d=0.5[bed];\
[0:a][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_void2.wav
ffmpeg -v error -y -i out/void2_silent.mp4 -i $A/mix_void2.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Void_V2_BolsoComZiper_9x16.mp4
echo done
