#!/usr/bin/env bash
# V3 audio: voiceover (make_vo.py v3) + Ever Flame film soundtrack as bed, laid so its first impact (src 10.5 s)
# lands on the offer (14.96 s); ducked under the voice, up after the last line. Lighter delivery encode at the end.
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=22.6; D=4460   # bed delay in ms = offer start - 10.5 s
ffmpeg -v error -y -i $A/vo_v3.wav -i src/v01_studio.mp4 -i src/v01_studio.mp4 -filter_complex "\
[1:a]atrim=0:4.8,asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=4.4:d=0.4[b1];\
[2:a]asetpts=PTS-STARTPTS,adelay=$D|$D,afade=t=in:st=4.46:d=0.4[b2];\
[b1][b2]amix=inputs=2:normalize=0,volume='if(lt(t,21.2),0.42,0.95)':eval=frame,afade=t=out:st=22.0:d=0.6[bed];\
[0:a][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_v3.wav
ffmpeg -v error -y -i out/v3_silent.mp4 -i $A/mix_v3.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_EverFlame_V3_FotoVsPeca_9x16.mp4
echo done
