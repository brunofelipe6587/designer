#!/bin/bash
# Creative 4 (same as creative 2) has no voice: the brand's own reel music (store-window reel) from the top, faded out under the end card,
# loudness matched to -16 LUFS with a -2 dBTP limiter.
set -e
cd "$(dirname "$0")"
SRC=brutos/reel-vitrine-da-semana_720p.mp4
DUR=21.7
ffmpeg -y -loglevel error -i $SRC -vn -af "atrim=0:$DUR,asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st=$(python3 -c "print($DUR-1.8)"):d=1.75,apad=whole_dur=$DUR" -ar 48000 -ac 2 build/music4.wav
M=$(ffmpeg -hide_banner -i build/music4.wav -af loudnorm=I=-16:TP=-2:LRA=11:print_format=json -f null - 2>&1 | python3 -c "import sys,json; t=sys.stdin.read(); j=json.loads(t[t.rindex('{'):]); print(j['input_i'],j['input_tp'],j['input_lra'],j['input_thresh'])")
read II TP LRA TH <<< "$M"
ffmpeg -y -loglevel error -i build/music4.wav -af "loudnorm=I=-16:TP=-2:LRA=11:measured_I=$II:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:linear=true,alimiter=limit=0.79:attack=3:release=60" -ar 48000 -ac 2 -c:a aac -b:a 192k out/video4_audio.m4a
