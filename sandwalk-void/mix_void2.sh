#!/usr/bin/env bash
# Void 2: voiceover (make_vo.py void2) over the brand video's track as bed — laid twice to cover the 24 s, EQ-carved and
# ducked under the voice, up after the last line — loudness-normalised and muxed with the render.
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=24.0
ffmpeg -v error -y -i $A/vo_void2.wav -i src/v01_studio.mov -i src/v01_studio.mov -filter_complex "\
[1:a]aresample=48000,atrim=0:18.4,afade=t=out:st=18.0:d=0.4[b1];\
[2:a]aresample=48000,asetpts=PTS-STARTPTS,afade=t=in:d=0.3,adelay=18000|18000[b2];\
[b1][b2]amix=inputs=2:normalize=0,equalizer=f=2000:t=q:w=1.2:g=-8,volume='if(lt(t,22.4),0.17,0.85)':eval=frame,afade=t=out:st=23.4:d=0.6[bed];\
[0:a][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_void2.wav
ffmpeg -v error -y -i out/void2_silent.mp4 -i $A/mix_void2.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_Void_V2_4Motivos_9x16.mp4
echo done
