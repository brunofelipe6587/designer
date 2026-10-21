#!/bin/bash
# Cuts Fran's voice with the same EDL as video1.html. The reel's audio already peaks near 0 dBFS, so the chain tames it:
# rumble/plosive cut (high-pass + low shelf), declip, gentle compression, a quiet room-tone bed so cuts never drop to
# silence, then a linear two-pass loudness match to -16 LUFS with a -2 dBTP limiter.
set -e
cd "$(dirname "$0")"
SRC=brutos/reel-fran-como-comprar_720p.mp4
DUR=33.4
SEGS="0.00:4.02 12.00:19.50 20.55:26.32 34.45:41.05 41.84:43.74 4.45:5.42 6.12:7.66 9.72:11.75"
F=""; L=""; i=0
for s in $SEGS; do
  a=${s%:*}; b=${s#*:}; d=$(python3 -c "print(round($b-$a-0.035,3))")
  F="$F[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.035,afade=t=out:st=$d:d=0.035[s$i];"; L="$L[s$i]"; i=$((i+1))
done
TONE="[0:a]atrim=19.62:20.42,asetpts=PTS-STARTPTS,aloop=loop=-1:size=38400,atrim=0:$DUR,volume=0.45,afade=t=out:st=$(python3 -c "print($DUR-1.6)"):d=1.5[tone]"
CHAIN="highpass=f=90:poles=2,lowshelf=f=220:g=-3,adeclip,acompressor=threshold=0.125:ratio=3:attack=4:release=90:knee=4:makeup=1"
ffmpeg -y -loglevel error -i $SRC -filter_complex "${F}${L}concat=n=$i:v=0:a=1,apad=whole_dur=$DUR[v];$TONE;[v][tone]amix=inputs=2:duration=first:normalize=0,$CHAIN[a]" -map "[a]" -ar 48000 -ac 1 build/voice1.wav
M=$(ffmpeg -hide_banner -i build/voice1.wav -af loudnorm=I=-16:TP=-2:LRA=9:print_format=json -f null - 2>&1 | python3 -c "import sys,json,re; t=sys.stdin.read(); j=json.loads(t[t.rindex('{'):]); print(j['input_i'],j['input_tp'],j['input_lra'],j['input_thresh'])")
read II TP LRA TH <<< "$M"
ffmpeg -y -loglevel error -i build/voice1.wav -af "loudnorm=I=-16:TP=-2:LRA=9:measured_I=$II:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:linear=true,alimiter=limit=0.79:attack=3:release=60" -ar 48000 -ac 2 -c:a aac -b:a 192k out/video1_audio.m4a
