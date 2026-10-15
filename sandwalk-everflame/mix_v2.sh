#!/usr/bin/env bash
# V2 audio: voiceover (make_vo_v2.py) + the Ever Flame film soundtrack as bed. The bed's ambient intro is laid twice
# so its impacts land on the offer (src 10.5 s → 15.6 s); ducked under the voice, up for the final second.
set -euo pipefail
cd "$(dirname "$0")"
A=audio; DUR=21.0
ffmpeg -v error -y -i $A/vo_v2.wav -i src/v01_studio.mp4 -i src/v01_studio.mp4 -filter_complex "\
[1:a]atrim=0:5.4,asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=5.0:d=0.4[b1];\
[2:a]asetpts=PTS-STARTPTS,adelay=5100|5100,afade=t=in:st=5.1:d=0.4[b2];\
[b1][b2]amix=inputs=2:normalize=0,volume='if(lt(t,19.4),0.42,0.95)':eval=frame,afade=t=out:st=20.4:d=0.6[bed];\
[0:a]volume=1.0[vo];[vo][bed]amix=inputs=2:normalize=0:duration=longest,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -ac 2 $A/mix_v2.wav
ffmpeg -v error -y -i out/v2_silent.mp4 -i $A/mix_v2.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  out/tmp_v2.mp4
# lighter delivery encode (the flat-lay macro is heavy at the render CRF)
ffmpeg -v error -y -i out/tmp_v2.mp4 -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a copy -movflags +faststart \
  out/SandWalk_EverFlame_V2_3Detalhes_9x16.mp4 && rm out/tmp_v2.mp4
echo done
