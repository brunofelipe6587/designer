#!/bin/bash
# Cuts Fran's voice with the same EDL as video1.html. The reel's audio already peaks near 0 dBFS, so the chain tames it:
# rumble/plosive cut (high-pass + low shelf), declip, gentle compression, then a linear two-pass loudness match to
# -16 LUFS with a -2 dBTP limiter. After her last line the track fades out and stays silent under the end card.
set -e
cd "$(dirname "$0")"
SRC=brutos/reel-fran-como-comprar_720p.mp4
DUR=33.0
SEGS="0.00:4.02 12.00:19.50 20.55:26.32 34.45:41.05 41.84:43.74 4.45:5.42 6.12:7.66 9.72:11.98"
F=""; L=""; i=0
for s in $SEGS; do
  a=${s%:*}; b=${s#*:}; fo=0.035; [ "$s" = "9.72:11.98" ] && fo=0.25  # her last word gets a soft tail
  d=$(python3 -c "print(round($b-$a-$fo,3))")
  F="$F[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.035,afade=t=out:st=$d:d=$fo[s$i];"; L="$L[s$i]"; i=$((i+1))
done
CHAIN="highpass=f=90:poles=2,lowshelf=f=220:g=-3,adeclip,acompressor=threshold=0.125:ratio=3:attack=4:release=90:knee=4:makeup=1"
ffmpeg -y -loglevel error -i $SRC -filter_complex "${F}${L}concat=n=$i:v=0:a=1,$CHAIN,apad=whole_dur=$DUR[a]" -map "[a]" -ar 48000 -ac 1 build/voice1.wav
M=$(ffmpeg -hide_banner -i build/voice1.wav -af loudnorm=I=-16:TP=-2:LRA=9:print_format=json -f null - 2>&1 | python3 -c "import sys,json,re; t=sys.stdin.read(); j=json.loads(t[t.rindex('{'):]); print(j['input_i'],j['input_tp'],j['input_lra'],j['input_thresh'])")
read II TP LRA TH <<< "$M"
ffmpeg -y -loglevel error -i build/voice1.wav -af "loudnorm=I=-16:TP=-2:LRA=9:measured_I=$II:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:linear=true,alimiter=limit=0.79:attack=3:release=60" -ar 48000 -ac 2 -c:a aac -b:a 192k out/video1_audio.m4a
