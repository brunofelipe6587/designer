#!/bin/bash
# Cuts Fran's voice with the same EDL as video1.html, 20 ms fades at every cut, light rumble cut and loudness to -14 LUFS.
set -e
cd "$(dirname "$0")"
SRC=brutos/reel-fran-como-comprar_720p.mp4
SEGS="0.00:4.02 4.45:5.42 6.12:7.66 9.72:11.75 12.00:19.50 20.55:26.32 34.45:41.05 41.84:45.25"
F=""; L=""; i=0
for s in $SEGS; do
  a=${s%:*}; b=${s#*:}; d=$(python3 -c "print(round($b-$a-0.02,3))")
  F="$F[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=$d:d=0.02[s$i];"; L="$L[s$i]"; i=$((i+1))
done
ffmpeg -y -loglevel error -i $SRC -filter_complex "${F}${L}concat=n=$i:v=0:a=1,highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=9,apad=whole_dur=33.6[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k out/video1_audio.m4a
